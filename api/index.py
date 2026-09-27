from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import io
import traceback
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN

def make_bg(slide, prs, color):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.color.rgb = color
    return bg

# ==============================================================================
# 1. DESIGN SYSTÈME : TERRACOTTA & CRÈME (Éditorial Magazine)
# ==============================================================================
def render_terracotta(prs, slides):
    C_TERRA = RGBColor(184, 67, 35)
    C_CREAM = RGBColor(246, 244, 240)
    C_DARK = RGBColor(38, 28, 24)
    C_WHITE = RGBColor(255, 255, 255)
    C_BORDER = RGBColor(228, 222, 214)

    for idx, s in enumerate(slides):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        stype = s.get('type', 'content')

        if stype == 'cover' or idx == 0:
            make_bg(slide, prs, C_TERRA)
            card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.0), Inches(4.2), Inches(5.2))
            card.fill.solid()
            card.fill.fore_color.rgb = C_CREAM
            card.line.color.rgb = C_CREAM
            p = card.text_frame.paragraphs[0]
            p.text = "SOUTENANCE"
            p.font.name = "Georgia"
            p.font.size = Pt(22)
            p.font.bold = True
            p.font.color.rgb = C_TERRA
            p.alignment = PP_ALIGN.CENTER

            tx = slide.shapes.add_textbox(Inches(5.5), Inches(1.8), Inches(7.0), Inches(4.0))
            tf = tx.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = s.get('section', 'SOUTENANCE ACADÉMIQUE').upper()
            p0.font.size = Pt(12)
            p0.font.color.rgb = RGBColor(230, 175, 160)
            p0.space_after = Pt(14)
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Georgia"
            p1.font.size = Pt(34)
            p1.font.bold = True
            p1.font.color.rgb = C_WHITE
            p1.space_after = Pt(18)
            for pt in s.get('points', [])[:2]:
                p2 = tf.add_paragraph()
                p2.text = f"—  {pt}"
                p2.font.size = Pt(14)
                p2.font.color.rgb = C_CREAM
                p2.space_after = Pt(6)

        elif stype == 'agenda':
            make_bg(slide, prs, C_TERRA)
            tx = slide.shapes.add_textbox(Inches(6.5), Inches(5.8), Inches(6.0), Inches(1.2))
            p = tx.text_frame.paragraphs[0]
            p.text = "TABLE of CONTENTS"
            p.font.name = "Georgia"
            p.font.size = Pt(32)
            p.font.color.rgb = C_WHITE
            p.alignment = PP_ALIGN.RIGHT

            top_y = Inches(1.2)
            for pt in s.get('points', [])[:5]:
                bx = slide.shapes.add_textbox(Inches(1.0), top_y, Inches(10.0), Inches(0.6))
                p = bx.text_frame.paragraphs[0]
                p.text = pt
                p.font.size = Pt(16)
                p.font.bold = True
                p.font.color.rgb = C_WHITE
                sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), top_y + Inches(0.65), Inches(11.3), Pt(1))
                sep.fill.solid()
                sep.fill.fore_color.rgb = C_WHITE
                sep.line.color.rgb = C_WHITE
                top_y += Inches(0.9)

        else:
            make_bg(slide, prs, C_CREAM)
            hb = slide.shapes.add_textbox(Inches(0.9), Inches(0.7), Inches(11.5), Inches(1.5))
            tf = hb.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = s.get('section', 'DÉMARCHE').upper()
            p0.font.size = Pt(11)
            p0.font.bold = True
            p0.font.color.rgb = C_TERRA
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Georgia"
            p1.font.size = Pt(28)
            p1.font.bold = True
            p1.font.color.rgb = C_DARK

            sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.9), Inches(2.2), Inches(11.5), Pt(1.5))
            sep.fill.solid()
            sep.fill.fore_color.rgb = C_TERRA
            sep.line.color.rgb = C_TERRA

            y = Inches(2.6)
            for pt in s.get('points', [])[:4]:
                c = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), y, Inches(6.8), Inches(0.95))
                c.fill.solid()
                c.fill.fore_color.rgb = C_WHITE
                c.line.color.rgb = C_BORDER
                c.line.width = Pt(1)
                p = c.text_frame.paragraphs[0]
                p.text = f"•  {pt}"
                p.font.size = Pt(14)
                p.font.color.rgb = C_DARK
                y += Inches(1.15)

            rc = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.1), Inches(2.6), Inches(4.3), Inches(4.2))
            rc.fill.solid()
            rc.fill.fore_color.rgb = C_WHITE
            rc.line.color.rgb = C_TERRA
            rc.line.width = Pt(1.5)
            p = rc.text_frame.paragraphs[0]
            p.text = "ESPACE VISUEL"
            p.font.name = "Georgia"
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = C_TERRA
            p.alignment = PP_ALIGN.CENTER
            p.space_before = Pt(80)

# ==============================================================================
# 2. DESIGN SYSTÈME : MICROSOFT DARK MODERNIST (Bento Grid Cyber & Tech)
# ==============================================================================
def render_dark_modernist(prs, slides):
    C_BG = RGBColor(9, 13, 22)        # Noir obsidienne profond
    C_CARD = RGBColor(19, 27, 46)     # Carte bento sombre
    C_BORDER = RGBColor(38, 54, 88)   # Bordure subtile
    C_CYAN = RGBColor(6, 182, 212)     # Cyan néon vif
    C_TEXT = RGBColor(241, 245, 249)   # Blanc glace
    C_MUTED = RGBColor(148, 163, 184)  # Gris argent

    for idx, s in enumerate(slides):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        make_bg(slide, prs, C_BG)
        stype = s.get('type', 'content')

        # Bande supérieure néon technologique
        neon_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
        neon_bar.fill.solid()
        neon_bar.fill.fore_color.rgb = C_CYAN
        neon_bar.line.color.rgb = C_CYAN

        if stype == 'cover' or idx == 0:
            # Badge Code Tech
            badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.2), Inches(3.6), Inches(0.5))
            badge.fill.solid()
            badge.fill.fore_color.rgb = C_CARD
            badge.line.color.rgb = C_CYAN
            badge.line.width = Pt(1)
            p = badge.text_frame.paragraphs[0]
            p.text = "[ SYSTEM // SOUTENANCE ]"
            p.font.name = "Consolas"
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = C_CYAN
            p.alignment = PP_ALIGN.CENTER

            # Grand Titre Tech
            tx = slide.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(2.2))
            tf = tx.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = s.get('titre', '').upper()
            p.font.name = "Trebuchet MS"
            p.font.size = Pt(40)
            p.font.bold = True
            p.font.color.rgb = C_TEXT

            # 2 Cartes Bento d'introduction en bas
            pts = s.get('points', [])
            card1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.5), Inches(5.4), Inches(2.0))
            card1.fill.solid()
            card1.fill.fore_color.rgb = C_CARD
            card1.line.color.rgb = C_BORDER
            p1 = card1.text_frame.paragraphs[0]
            p1.text = "PROJET ACADÉMIQUE"
            p1.font.name = "Trebuchet MS"
            p1.font.size = Pt(12)
            p1.font.bold = True
            p1.font.color.rgb = C_CYAN
            p1b = card1.text_frame.add_paragraph()
            p1b.text = pts[0] if len(pts) > 0 else "Session de soutenance"
            p1b.font.size = Pt(13)
            p1b.font.color.rgb = C_MUTED
            p1b.space_before = Pt(8)

            card2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.5), Inches(5.5), Inches(2.0))
            card2.fill.solid()
            card2.fill.fore_color.rgb = C_CARD
            card2.line.color.rgb = C_BORDER
            p2 = card2.text_frame.paragraphs[0]
            p2.text = "CADRE DE RECHERCHE"
            p2.font.name = "Trebuchet MS"
            p2.font.size = Pt(12)
            p2.font.bold = True
            p2.font.color.rgb = C_CYAN
            p2b = card2.text_frame.add_paragraph()
            p2b.text = pts[1] if len(pts) > 1 else "Spécialité & Démarche"
            p2b.font.size = Pt(13)
            p2b.font.color.rgb = C_MUTED
            p2b.space_before = Pt(8)

        elif stype == 'agenda':
            # Titre Sommaire Bento
            tx = slide.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(0.8))
            p = tx.text_frame.paragraphs[0]
            p.text = "00 // ARCHITECTURE DE LA SOUTENANCE"
            p.font.name = "Trebuchet MS"
            p.font.size = Pt(22)
            p.font.bold = True
            p.font.color.rgb = C_CYAN

            # Grille de 4 Cartes Bento modernes
            coords = [
                (Inches(1.0), Inches(1.8), Inches(5.4), Inches(2.2)),
                (Inches(6.8), Inches(1.8), Inches(5.5), Inches(2.2)),
                (Inches(1.0), Inches(4.4), Inches(5.4), Inches(2.2)),
                (Inches(6.8), Inches(4.4), Inches(5.5), Inches(2.2))
            ]
            for i, pt in enumerate(s.get('points', [])[:4]):
                bx, by, bw, bh = coords[i]
                bcard = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, bw, bh)
                bcard.fill.solid()
                bcard.fill.fore_color.rgb = C_CARD
                bcard.line.color.rgb = C_BORDER
                p_num = bcard.text_frame.paragraphs[0]
                p_num.text = f"MODULE 0{i+1}"
                p_num.font.name = "Consolas"
                p_num.font.size = Pt(12)
                p_num.font.bold = True
                p_num.font.color.rgb = C_CYAN
                p_title = bcard.text_frame.add_paragraph()
                p_title.text = pt
                p_title.font.name = "Trebuchet MS"
                p_title.font.size = Pt(15)
                p_title.font.bold = True
                p_title.font.color.rgb = C_TEXT
                p_title.space_before = Pt(10)

        else:
            # Header Tech
            hb = slide.shapes.add_textbox(Inches(1.0), Inches(0.7), Inches(11.3), Inches(1.3))
            tf = hb.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = f"// {s.get('section', 'ANALYSE').upper()}"
            p0.font.name = "Consolas"
            p0.font.size = Pt(11)
            p0.font.bold = True
            p0.font.color.rgb = C_CYAN
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Trebuchet MS"
            p1.font.size = Pt(26)
            p1.font.bold = True
            p1.font.color.rgb = C_TEXT

            # Cartes Horizontales Pleine Largeur avec liseré cyan
            y = Inches(2.2)
            for pt in s.get('points', [])[:4]:
                card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(11.3), Inches(1.0))
                card.fill.solid()
                card.fill.fore_color.rgb = C_CARD
                card.line.color.rgb = C_BORDER
                # Liseré cyan latéral
                stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), y, Inches(0.12), Inches(1.0))
                stripe.fill.solid()
                stripe.fill.fore_color.rgb = C_CYAN
                stripe.line.color.rgb = C_CYAN
                p = card.text_frame.paragraphs[0]
                p.text = f"   ▶   {pt}"
                p.font.name = "Segoe UI"
                p.font.size = Pt(14)
                p.font.color.rgb = C_TEXT
                y += Inches(1.2)

# ==============================================================================
# 3. DESIGN SYSTÈME : MICROSOFT PACIFIC EXECUTIVE (Corporate McKinsey / BCG)
# ==============================================================================
def render_pacific_navy(prs, slides):
    C_NAVY = RGBColor(10, 25, 47)      # Marine Royal profond
    C_BG = RGBColor(248, 250, 252)     # Blanc pur froid
    C_GOLD = RGBColor(197, 168, 128)   # Or sobre prestige
    C_COBALT = RGBColor(29, 78, 216)   # Bleu Cobalt vif
    C_WHITE = RGBColor(255, 255, 255)
    C_TEXT = RGBColor(15, 23, 42)
    C_MUTED = RGBColor(100, 116, 139)

    for idx, s in enumerate(slides):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        make_bg(slide, prs, C_BG)
        stype = s.get('type', 'content')

        if stype == 'cover' or idx == 0:
            # Grand bandeau Marine Royal couvrant les 60% supérieurs
            top_band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(4.6))
            top_band.fill.solid()
            top_band.fill.fore_color.rgb = C_NAVY
            top_band.line.color.rgb = C_NAVY

            # Liseré or de prestige
            gold_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(4.55), prs.slide_width, Inches(0.08))
            gold_line.fill.solid()
            gold_line.fill.fore_color.rgb = C_GOLD
            gold_line.line.color.rgb = C_GOLD

            # Titre dans le bandeau marine
            tx = slide.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(3.0))
            tf = tx.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = "RAPPORT EXÉCUTIF • SOUTENANCE DE MÉMOIRE"
            p0.font.name = "Arial"
            p0.font.size = Pt(11)
            p0.font.bold = True
            p0.font.color.rgb = C_GOLD
            p0.space_after = Pt(12)
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Palatino Linotype"
            p1.font.size = Pt(36)
            p1.font.bold = True
            p1.font.color.rgb = C_WHITE

            # 2 Cartes de cadrage sur le fond clair inférieur
            pts = s.get('points', [])
            card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.1), Inches(11.3), Inches(1.6))
            card.fill.solid()
            card.fill.fore_color.rgb = C_WHITE
            card.line.color.rgb = RGBColor(226, 232, 240)
            p_c = card.text_frame.paragraphs[0]
            p_c.text = "NOTE DE SYNTHÈSE"
            p_c.font.name = "Arial"
            p_c.font.size = Pt(11)
            p_c.font.bold = True
            p_c.font.color.rgb = C_COBALT
            for pt in pts[:2]:
                p_sub = card.text_frame.add_paragraph()
                p_sub.text = f"—  {pt}"
                p_sub.font.name = "Arial"
                p_sub.font.size = Pt(13)
                p_sub.font.color.rgb = C_MUTED
                p_sub.space_before = Pt(4)

        elif stype == 'agenda':
            # Header Corporate
            head = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(1.3))
            head.fill.solid()
            head.fill.fore_color.rgb = C_NAVY
            head.line.color.rgb = C_NAVY
            p = head.text_frame.paragraphs[0]
            p.text = "SOMMAIRE EXÉCUTIF"
            p.font.name = "Palatino Linotype"
            p.font.size = Pt(22)
            p.font.bold = True
            p.font.color.rgb = C_WHITE
            p.space_before = Pt(20)

            # 4 Rangs horizontaux avec pastille circulaire bleu cobalt
            y = Inches(1.8)
            for i, pt in enumerate(s.get('points', [])[:4]):
                row = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(11.3), Inches(1.1))
                row.fill.solid()
                row.fill.fore_color.rgb = C_WHITE
                row.line.color.rgb = RGBColor(226, 232, 240)
                # Pastille circulaire
                badge = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.3), y + Inches(0.2), Inches(0.7), Inches(0.7))
                badge.fill.solid()
                badge.fill.fore_color.rgb = C_COBALT
                badge.line.color.rgb = C_COBALT
                p_b = badge.text_frame.paragraphs[0]
                p_b.text = str(i + 1)
                p_b.font.size = Pt(14)
                p_b.font.bold = True
                p_b.font.color.rgb = C_WHITE
                p_b.alignment = PP_ALIGN.CENTER
                # Texte
                tx = slide.shapes.add_textbox(Inches(2.3), y + Inches(0.25), Inches(9.8), Inches(0.7))
                p_t = tx.text_frame.paragraphs[0]
                p_t.text = pt
                p_t.font.name = "Arial"
                p_t.font.size = Pt(16)
                p_t.font.bold = True
                p_t.font.color.rgb = C_TEXT
                y += Inches(1.3)

        else:
            # Ruban Supérieur Bleu Marine
            head = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(1.5))
            head.fill.solid()
            head.fill.fore_color.rgb = C_NAVY
            head.line.color.rgb = C_NAVY
            tf = head.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = s.get('section', 'AXE STRATÉGIQUE').upper()
            p0.font.name = "Arial"
            p0.font.size = Pt(10)
            p0.font.bold = True
            p0.font.color.rgb = C_GOLD
            p0.space_before = Pt(12)
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Palatino Linotype"
            p1.font.size = Pt(24)
            p1.font.bold = True
            p1.font.color.rgb = C_WHITE

            # DISPOSITION EN 3 COLONNES PILIERS (Style Conseil de Direction)
            pts = s.get('points', [])
            col_w = Inches(3.6)
            col_gap = Inches(0.25)
            for c_i in range(min(3, len(pts))):
                cx = Inches(1.0) + c_i * (col_w + col_gap)
                pcard = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(2.0), col_w, Inches(4.8))
                pcard.fill.solid()
                pcard.fill.fore_color.rgb = C_WHITE
                pcard.line.color.rgb = RGBColor(226, 232, 240)
                # En-tête de colonne bleu cobalt
                ctop = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx, Inches(2.0), col_w, Inches(0.6))
                ctop.fill.solid()
                ctop.fill.fore_color.rgb = C_COBALT
                ctop.line.color.rgb = C_COBALT
                p_ch = ctop.text_frame.paragraphs[0]
                p_ch.text = f"PILIER 0{c_i + 1}"
                p_ch.font.name = "Arial"
                p_ch.font.size = Pt(11)
                p_ch.font.bold = True
                p_ch.font.color.rgb = C_WHITE
                p_ch.alignment = PP_ALIGN.CENTER
                # Texte du pilier
                ctx = slide.shapes.add_textbox(cx + Inches(0.2), Inches(2.8), col_w - Inches(0.4), Inches(3.8))
                tf_ctx = ctx.text_frame
                tf_ctx.word_wrap = True
                p_ct = tf_ctx.paragraphs[0]
                p_ct.text = pts[c_i]
                p_ct.font.name = "Arial"
                p_ct.font.size = Pt(14)
                p_ct.font.color.rgb = C_TEXT

# ==============================================================================
# 4. DESIGN SYSTÈME : MICROSOFT NORDIC SAGE (Organique Scandinave & Santé)
# ==============================================================================
def render_nordic_sage(prs, slides):
    C_SAGE = RGBColor(45, 62, 53)       # Vert forêt sauge profond
    C_LINEN = RGBColor(244, 246, 240)   # Fond lin végétal clair
    C_COPPER = RGBColor(195, 125, 78)   # Cuivre terre cuite
    C_WHITE = RGBColor(255, 255, 255)
    C_DARK = RGBColor(28, 38, 32)
    C_MUTED = RGBColor(120, 135, 125)

    for idx, s in enumerate(slides):
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        make_bg(slide, prs, C_LINEN)
        stype = s.get('type', 'content')

        if stype == 'cover' or idx == 0:
            # Bloc sculptural vert sauge à gauche (arche organique)
            left_arch = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(5.0), Inches(5.9))
            left_arch.fill.solid()
            left_arch.fill.fore_color.rgb = C_SAGE
            left_arch.line.color.rgb = C_SAGE
            p = left_arch.text_frame.paragraphs[0]
            p.text = "SOUTENANCE"
            p.font.name = "Century Gothic"
            p.font.size = Pt(28)
            p.font.bold = True
            p.font.color.rgb = C_WHITE
            p.alignment = PP_ALIGN.CENTER
            p.space_before = Pt(140)

            # Contenu droit avec étiquette capsule cuivrée
            tx = slide.shapes.add_textbox(Inches(6.4), Inches(1.5), Inches(6.1), Inches(4.5))
            tf = tx.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = "MÉMOIRE & RECHERCHE APPLIQUÉE"
            p0.font.name = "Calibri"
            p0.font.size = Pt(12)
            p0.font.bold = True
            p0.font.color.rgb = C_COPPER
            p0.space_after = Pt(14)
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Century Gothic"
            p1.font.size = Pt(32)
            p1.font.bold = True
            p1.font.color.rgb = C_DARK
            p1.space_after = Pt(20)
            for pt in s.get('points', [])[:2]:
                p2 = tf.add_paragraph()
                p2.text = f"◆   {pt}"
                p2.font.name = "Calibri"
                p2.font.size = Pt(14)
                p2.font.color.rgb = C_MUTED
                p2.space_after = Pt(8)

        elif stype == 'agenda':
            # Titre organique
            tx = slide.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(0.8))
            p = tx.text_frame.paragraphs[0]
            p.text = "PARCOURS DE RECHERCHE"
            p.font.name = "Century Gothic"
            p.font.size = Pt(24)
            p.font.bold = True
            p.font.color.rgb = C_SAGE

            # Disposition en capsules (Pills)
            y = Inches(1.8)
            for i, pt in enumerate(s.get('points', [])[:4]):
                # Capsule arrondie
                pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(11.3), Inches(1.1))
                pill.fill.solid()
                pill.fill.fore_color.rgb = C_WHITE
                pill.line.color.rgb = RGBColor(218, 224, 214)
                # Badge numéro cuivré
                num_badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), y + Inches(0.2), Inches(1.0), Inches(0.7))
                num_badge.fill.solid()
                num_badge.fill.fore_color.rgb = C_COPPER
                num_badge.line.color.rgb = C_COPPER
                p_n = num_badge.text_frame.paragraphs[0]
                p_n.text = f"0{i+1}"
                p_n.font.name = "Century Gothic"
                p_n.font.size = Pt(14)
                p_n.font.bold = True
                p_n.font.color.rgb = C_WHITE
                p_n.alignment = PP_ALIGN.CENTER
                # Titre de section
                stx = slide.shapes.add_textbox(Inches(2.6), y + Inches(0.25), Inches(9.4), Inches(0.7))
                p_s = stx.text_frame.paragraphs[0]
                p_s.text = pt
                p_s.font.name = "Century Gothic"
                p_s.font.size = Pt(15)
                p_s.font.bold = True
                p_s.font.color.rgb = C_DARK
                y += Inches(1.3)

        else:
            # En-tête Organique
            hb = slide.shapes.add_textbox(Inches(1.0), Inches(0.7), Inches(11.3), Inches(1.3))
            tf = hb.text_frame
            tf.word_wrap = True
            p0 = tf.paragraphs[0]
            p0.text = f"◆  {s.get('section', 'AXE DE RECHERCHE').upper()}"
            p0.font.name = "Calibri"
            p0.font.size = Pt(11)
            p0.font.bold = True
            p0.font.color.rgb = C_COPPER
            p1 = tf.add_paragraph()
            p1.text = s.get('titre', '')
            p1.font.name = "Century Gothic"
            p1.font.size = Pt(28)
            p1.font.bold = True
            p1.font.color.rgb = C_SAGE

            # Grille 2 x 2 de Galets Blancs Arrondis
            coords = [
                (Inches(1.0), Inches(2.2), Inches(5.4), Inches(2.2)),
                (Inches(6.9), Inches(2.2), Inches(5.4), Inches(2.2)),
                (Inches(1.0), Inches(4.7), Inches(5.4), Inches(2.2)),
                (Inches(6.9), Inches(4.7), Inches(5.4), Inches(2.2))
            ]
            for i, pt in enumerate(s.get('points', [])[:4]):
                gx, gy, gw, gh = coords[i]
                gcard = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx, gy, gw, gh)
                gcard.fill.solid()
                gcard.fill.fore_color.rgb = C_WHITE
                gcard.line.color.rgb = RGBColor(218, 224, 214)
                p_dot = gcard.text_frame.paragraphs[0]
                p_dot.text = "◆"
                p_dot.font.size = Pt(14)
                p_dot.font.color.rgb = C_COPPER
                p_txt = gcard.text_frame.add_paragraph()
                p_txt.text = pt
                p_txt.font.name = "Calibri"
                p_txt.font.size = Pt(14)
                p_txt.font.color.rgb = C_DARK
                p_txt.space_before = Pt(6)

# ==============================================================================
# DISPATCHER DU SERVEUR HTTP
# ==============================================================================
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
            prs = Presentation()
            prs.slide_width = Inches(13.333)
            prs.slide_height = Inches(7.5)

            theme_key = data.get('theme', 'terracotta')
            slides_content = data.get('slides', [])

            # Aiguillage vers le bon moteur géométrique
            if theme_key == 'dark_modernist':
                render_dark_modernist(prs, slides_content)
            elif theme_key == 'pacific_navy':
                render_pacific_navy(prs, slides_content)
            elif theme_key == 'nordic_sage':
                render_nordic_sage(prs, slides_content)
            else:
                render_terracotta(prs, slides_content)

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
    print("[PYTHON] Serveur GhostPPTX Multi-Architectures actif sur http://127.0.0.1:5328", flush=True)
    httpd.serve_forever()