from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=" Kleinanzeigen API\, version=\1.0.0\)

# CORS Middleware
app.add_middleware(
 CORSMiddleware,
 allow_origins=[\http://vaydu.com\, \http://www.vaydu.com\],
 allow_credentials=True,
 allow_methods=[\*\],
 allow_headers=[\*\],
)

@app.get(\/\)
async def root():
 return {\message\: \Kleinanzeigen API lÃ¤uft!\}

@app.get(\/api/health\)
async def health():
 return {\status\: \ok\, \message\: \Kleinanzeigen API lÃ¤uft!\}

if __name__ == \__main__\:
 import uvicorn
 uvicorn.run(app, host=\0.0.0.0\, port=8000)
