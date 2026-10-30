import os
from flask import Flask, render_template, request, send_file
import yt_dlp

app = Flask(__name__)

DOWNLOAD_FOLDER = 'downloads'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/video-downloader.html')
def video_downloader():
    return render_template('video-downloader.html')

@app.route('/qr-code-generator.html')
def qr_generator():
    return render_template('qr-code-generator.html')

@app.route('/download', methods=['POST'])
def download_media():
    url = request.form.get('url')
    format_option = request.form.get('formatOption', 'video')
    
    if not url:
        return "Please enter a URL", 400

    try:
        if format_option == 'audio':
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }
        else:
            ydl_opts = {
                'format': 'best',
                'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
            }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if format_option == 'audio':
                filename = os.path.splitext(filename)[0] + '.mp3'
        
        return send_file(filename, as_attachment=True)

    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
