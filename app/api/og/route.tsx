import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
              `,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 80px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <div
                style={{
                  fontSize: '60px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Quirk Dating
              </div>
            </div>

            {/* Main Text */}
            <div
              style={{
                fontSize: '70px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.1,
              }}
            >
              Find Love Through
            </div>
            <div
              style={{
                fontSize: '70px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '30px',
              }}
            >
              Your Unique Quirks
            </div>

            {/* Subtext */}
            <div
              style={{
                fontSize: '28px',
                color: '#6b7280',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              Authentic WhatsApp connections • No in-app chats • Real conversations
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}