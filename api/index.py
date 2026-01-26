from http.server import BaseHTTPRequestHandler
import json
import os
import io
from pptx import Presentation
from pptx.util import Pt

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Lire la longueur du contenu
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(str(e).encode())
            return

        # 2. Charger le template (Chemin relatif pour Vercel)
        # Sur Vercel, le fichier est dans le meme dossier que le script
        template_path = os.path.join(os.path.dirname(__file__), 'template.pptx')

        try:
            if os.path.exists(template_path):
                prs = Presentation(template_path)
            else:
                prs = Presentation()
                prs.slide_width = 12192000
                prs.slide_height = 6858000
        except Exception as e:
            # Fallback en cas d'erreur critique
            prs = Presentation()

        # 3. Remplir les slides (Ton code logique)
        slides_content = data.get('slides', [])
        for slide_data in slides_content:
            try:
                layout = prs.slide_layouts[3] # Deux contenus
            except:
                layout = prs.slide_layouts[1]

            slide = prs.slides.add_slide(layout)
            
            # Titre
            if slide.shapes.title:
                slide.shapes.title.text = slide_data.get('titre', 'Sans titre')

            # Contenu Gauche
            points = slide_data.get('points', [])
            if len(slide.placeholders) > 1:
                left_shape = slide.placeholders[1]
                tf = left_shape.text_frame
                tf.text = ""
                tf.word_wrap = True
                for point in points:
                    p = tf.add_paragraph()
                    p.text = point
                    p.level = 0
                    p.font.size = Pt(16) # Taille adaptée
                    p.space_after = Pt(10)

        # 4. Sauvegarder en mémoire (RAM) pour l'envoi
        ppt_stream = io.BytesIO()
        prs.save(ppt_stream)
        ppt_stream.seek(0)

        # 5. Envoyer la réponse HTTP (Fichier binaire)
        self.send_response(200)
        self.send_header('Content-type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
        self.send_header('Content-Disposition', 'attachment; filename="soutenance.pptx"')
        self.end_headers()
        self.wfile.write(ppt_stream.read())
        return