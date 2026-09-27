from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import io
import traceback
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN

# --- PALETTE DU MODÈLE SLIDESGO (Terracotta & Crème Lin) ---
COLOR_TERRACOTTA = RGBColor(184, 67, 35)    # #B84323
COLOR_CREAM      = RGBColor(246, 244, 240)  # #F6F4F0
COLOR_DARK       = RGBColor(38, 28, 24)     # #261C18
COLOR_WHITE      = RGBColor(255, 255, 255)
COLOR_MUTED_TERRA= RGBColor(225, 165, 145)
COLOR_MUTED_GREY = RGBColor(130, 120, 115)
COLOR_CARD_BORDER= RGBColor(228, 222, 214)

FONT_TITLE = "Georgia"
FONT_BODY  = "Segoe UI"

def set_slide_background(slide, prs, color):
    """Fond vectoriel pleine page sans contour."""
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.color.rgb = color  # Contour identique au fond = invisible et 100% stable
    return bg

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(f"JSON invalide: {str(e)}".encode())
            return

        try:
            # 1. Initialisation présentation 16:9
            prs = Presentation()
            prs.slide_width = Inches(13.333)
            prs.slide_height = Inches(7.5)
            blank_layout = prs.slide_layouts[6]

            slides_content = data.get('slides', [])

            for idx, slide_data in enumerate(slides_content):
                slide_type = slide_data.get('type', 'content')
                section = slide_data.get('section', '')
                titre = slide_data.get('titre', 'Sans titre')
                points = slide_data.get('points', [])

                slide = prs.slides.add_slide(blank_layout)

                # =========================================================
                # 1. SLIDE DE COUVERTURE
                # =========================================================
                if slide_type == 'cover' or idx == 0:
                    set_slide_background(slide, prs, COLOR_TERRACOTTA)

                    # Ligne décorative blanche
                    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.7), Inches(11.733), Pt(1.5))
                    line.fill.solid()
                    line.fill.fore_color.rgb = COLOR_WHITE
                    line.line.color.rgb = COLOR_WHITE

                    # Carte visuelle à gauche
                    card_left = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(4.2), Inches(5.2))
                    card_left.fill.solid()
                    card_left.fill.fore_color.rgb = COLOR_CREAM
                    card_left.line.color.rgb = COLOR_CREAM

                    tf_card = card_left.text_frame
                    tf_card.word_wrap = True
                    p_c1 = tf_card.paragraphs[0]
                    p_c1.text = "SOUTENANCE"
                    p_c1.font.name = FONT_TITLE
                    p_c1.font.size = Pt(22)
                    p_c1.font.bold = True
                    p_c1.font.color.rgb = COLOR_TERRACOTTA
                    p_c1.alignment = PP_ALIGN.CENTER

                    p_c2 = tf_card.add_paragraph()
                    p_c2.text = "ACADÉMIQUE"
                    p_c2.font.name = FONT_BODY
                    p_c2.font.size = Pt(12)
                    p_c2.font.bold = True
                    p_c2.font.color.rgb = COLOR_DARK
                    p_c2.space_before = Pt(8)
                    p_c2.alignment = PP_ALIGN.CENTER

                    # Zone titre à droite
                    tx_box = slide.shapes.add_textbox(Inches(5.5), Inches(1.8), Inches(7.0), Inches(3.8))
                    tf = tx_box.text_frame
                    tf.word_wrap = True

                    p_tag = tf.paragraphs[0]
                    p_tag.text = section.upper() or "SOUTENANCE DE MÉMOIRE"
                    p_tag.font.name = FONT_BODY
                    p_tag.font.size = Pt(12)
                    p_tag.font.bold = True
                    p_tag.font.color.rgb = COLOR_MUTED_TERRA
                    p_tag.space_after = Pt(14)

                    p_title = tf.add_paragraph()
                    p_title.text = titre
                    p_title.font.name = FONT_TITLE
                    p_title.font.size = Pt(34)
                    p_title.font.bold = True
                    p_title.font.color.rgb = COLOR_WHITE
                    p_title.space_after = Pt(18)

                    for pt in points[:2]:
                        p_pt = tf.add_paragraph()
                        p_pt.text = f"—  {pt}"
                        p_pt.font.name = FONT_BODY
                        p_pt.font.size = Pt(14)
                        p_pt.font.color.rgb = COLOR_CREAM
                        p_pt.space_after = Pt(6)

                # =========================================================
                # 2. SOMMAIRE / AGENDA
                # =========================================================
                elif slide_type == 'agenda':
                    set_slide_background(slide, prs, COLOR_TERRACOTTA)

                    # Texte "TABLE of CONTENTS"
                    toc_box = slide.shapes.add_textbox(Inches(6.5), Inches(5.8), Inches(6.0), Inches(1.2))
                    tf_toc = toc_box.text_frame
                    p_toc = tf_toc.paragraphs[0]
                    p_toc.text = "TABLE of CONTENTS"
                    p_toc.font.name = FONT_TITLE
                    p_toc.font.size = Pt(32)
                    p_toc.font.color.rgb = COLOR_WHITE
                    p_toc.alignment = PP_ALIGN.RIGHT

                    top_y = Inches(1.2)
                    for pt in points[:5]:
                        sec_box = slide.shapes.add_textbox(Inches(1.0), top_y, Inches(10.0), Inches(0.6))
                        tf_sec = sec_box.text_frame
                        p_sec = tf_sec.paragraphs[0]
                        p_sec.text = pt
                        p_sec.font.name = FONT_BODY
                        p_sec.font.size = Pt(16)
                        p_sec.font.bold = True
                        p_sec.font.color.rgb = COLOR_WHITE

                        sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), top_y + Inches(0.65), Inches(11.3), Pt(1))
                        sep.fill.solid()
                        sep.fill.fore_color.rgb = COLOR_WHITE
                        sep.line.color.rgb = COLOR_WHITE

                        top_y += Inches(0.9)

                # =========================================================
                # 3. DEUX COLONNES COMPARATIVES
                # =========================================================
                elif slide_type == 'two_column':
                    set_slide_background(slide, prs, COLOR_TERRACOTTA)

                    title_box = slide.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(1.2))
                    tf_t = title_box.text_frame
                    tf_t.word_wrap = True
                    p_t = tf_t.paragraphs[0]
                    p_t.text = titre
                    p_t.font.name = FONT_TITLE
                    p_t.font.size = Pt(30)
                    p_t.font.bold = True
                    p_t.font.color.rgb = COLOR_WHITE

                    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(2.0), Inches(11.3), Pt(1))
                    sep.fill.solid()
                    sep.fill.fore_color.rgb = COLOR_WHITE
                    sep.line.color.rgb = COLOR_WHITE

                    col_width = Inches(5.3)
                    col_gap = Inches(0.7)
                    col_lefts = [Inches(1.0), Inches(1.0) + col_width + col_gap]

                    mid = (len(points) + 1) // 2
                    point_groups = [points[:mid], points[mid:]]

                    for c_idx in range(2):
                        col_x = col_lefts[c_idx]

                        num_box = slide.shapes.add_textbox(col_x, Inches(2.4), Inches(2.0), Inches(0.8))
                        p_num = num_box.text_frame.paragraphs[0]
                        p_num.text = f"0{c_idx + 1}"
                        p_num.font.name = FONT_TITLE
                        p_num.font.size = Pt(28)
                        p_num.font.bold = True
                        p_num.font.color.rgb = COLOR_MUTED_TERRA

                        pts_box = slide.shapes.add_textbox(col_x, Inches(3.2), col_width, Inches(3.6))
                        tf_pts = pts_box.text_frame
                        tf_pts.word_wrap = True

                        pts_to_show = point_groups[c_idx] or ["Axe d'analyse complémentaire"]
                        for p_i, pt_text in enumerate(pts_to_show):
                            p_line = tf_pts.paragraphs[0] if p_i == 0 else tf_pts.add_paragraph()
                            p_line.text = f"•  {pt_text}"
                            p_line.font.name = FONT_BODY
                            p_line.font.size = Pt(15)
                            p_line.font.color.rgb = COLOR_WHITE
                            p_line.space_after = Pt(12)

                # =========================================================
                # 4. REMERCIEMENTS
                # =========================================================
                elif slide_type == 'thanks':
                    set_slide_background(slide, prs, COLOR_CREAM)

                    line_dec = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(2.8), Inches(11.733), Pt(1.5))
                    line_dec.fill.solid()
                    line_dec.fill.fore_color.rgb = COLOR_TERRACOTTA
                    line_dec.line.color.rgb = COLOR_TERRACOTTA

                    thx_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.0), Inches(11.0), Inches(1.6))
                    tf_thx = thx_box.text_frame
                    p_thx = tf_thx.paragraphs[0]
                    p_thx.text = "MERCI"
                    p_thx.font.name = FONT_TITLE
                    p_thx.font.size = Pt(54)
                    p_thx.font.bold = True
                    p_thx.font.color.rgb = COLOR_TERRACOTTA

                    sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(3.4), Inches(9.0), Inches(2.5))
                    tf_sub = sub_box.text_frame
                    tf_sub.word_wrap = True

                    p_s1 = tf_sub.paragraphs[0]
                    p_s1.text = "Avez-vous des questions ?"
                    p_s1.font.name = FONT_TITLE
                    p_s1.font.size = Pt(24)
                    p_s1.font.bold = True
                    p_s1.font.color.rgb = COLOR_DARK
                    p_s1.space_after = Pt(16)

                    for pt in points:
                        p_s2 = tf_sub.add_paragraph()
                        p_s2.text = f"—  {pt}"
                        p_s2.font.name = FONT_BODY
                        p_s2.font.size = Pt(15)
                        p_s2.font.color.rgb = COLOR_MUTED_GREY
                        p_s2.space_after = Pt(8)

                # =========================================================
                # 5. CONTENU STANDARD
                # =========================================================
                else:
                    set_slide_background(slide, prs, COLOR_CREAM)

                    header_box = slide.shapes.add_textbox(Inches(0.9), Inches(0.7), Inches(11.5), Inches(1.5))
                    tf_h = header_box.text_frame
                    tf_h.word_wrap = True

                    p_sec = tf_h.paragraphs[0]
                    p_sec.text = section.upper() or "DÉMARCHE"
                    p_sec.font.name = FONT_BODY
                    p_sec.font.size = Pt(11)
                    p_sec.font.bold = True
                    p_sec.font.color.rgb = COLOR_TERRACOTTA
                    p_sec.space_after = Pt(4)

                    p_tit = tf_h.add_paragraph()
                    p_tit.text = titre
                    p_tit.font.name = FONT_TITLE
                    p_tit.font.size = Pt(28)
                    p_tit.font.bold = True
                    p_tit.font.color.rgb = COLOR_DARK

                    sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.9), Inches(2.2), Inches(11.533), Pt(1.5))
                    sep.fill.solid()
                    sep.fill.fore_color.rgb = COLOR_TERRACOTTA
                    sep.line.color.rgb = COLOR_TERRACOTTA

                    y_pos = Inches(2.6)
                    card_height = Inches(0.95)
                    card_spacing = Inches(0.2)

                    for pt_text in points[:4]:
                        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), y_pos, Inches(6.8), card_height)
                        card.fill.solid()
                        card.fill.fore_color.rgb = COLOR_WHITE
                        card.line.color.rgb = COLOR_CARD_BORDER
                        card.line.width = Pt(1)

                        tf_c = card.text_frame
                        tf_c.word_wrap = True
                        tf_c.margin_left = Inches(0.25)
                        tf_c.margin_right = Inches(0.25)

                        p_pt = tf_c.paragraphs[0]
                        p_pt.text = f"•  {pt_text}"
                        p_pt.font.name = FONT_BODY
                        p_pt.font.size = Pt(14)
                        p_pt.font.color.rgb = COLOR_DARK

                        y_pos += card_height + card_spacing

                    # Cadre droit pour illustrations
                    right_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.1), Inches(2.6), Inches(4.3), Inches(4.2))
                    right_card.fill.solid()
                    right_card.fill.fore_color.rgb = COLOR_WHITE
                    right_card.line.color.rgb = COLOR_TERRACOTTA
                    right_card.line.width = Pt(1.5)

                    tf_rc = right_card.text_frame
                    tf_rc.word_wrap = True

                    p_r1 = tf_rc.paragraphs[0]
                    p_r1.text = "ESPACE VISUEL"
                    p_r1.font.name = FONT_TITLE
                    p_r1.font.size = Pt(14)
                    p_r1.font.bold = True
                    p_r1.font.color.rgb = COLOR_TERRACOTTA
                    p_r1.alignment = PP_ALIGN.CENTER
                    p_r1.space_before = Pt(80)

                    p_r2 = tf_rc.add_paragraph()
                    p_r2.text = "Graphique ou schéma réservé"
                    p_r2.font.name = FONT_BODY
                    p_r2.font.size = Pt(11)
                    p_r2.font.color.rgb = COLOR_MUTED_GREY
                    p_r2.alignment = PP_ALIGN.CENTER
                    p_r2.space_before = Pt(8)

            # Envoi binaire du PPTX
            ppt_stream = io.BytesIO()
            prs.save(ppt_stream)
            ppt_stream.seek(0)

            self.send_response(200)
            self.send_header('Content-type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
            self.send_header('Content-Disposition', 'attachment; filename="soutenance.pptx"')
            self.end_headers()
            self.wfile.write(ppt_stream.read())
            return

        except Exception as e:
            traceback.print_exc()
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Erreur interne Python: {str(e)}".encode())
            return

if __name__ == '__main__':
    server_address = ('127.0.0.1', 5328)
    httpd = HTTPServer(server_address, handler)
    print("Serveur Python GhostPPTX actif sur http://127.0.0.1:5328", flush=True)
    httpd.serve_forever()