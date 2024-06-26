'use client'

import styles from './styles/Home.module.css';
import { Button } from './components/ui/components'
import { signIn } from 'next-auth/react';

export default function Home() {

  return (
    <div>
      <main className={`${styles.container}`}>
        <div className='flex-col flex absolute top-[10%]'>

          <h2 className={`${styles.title} text-[#c65e5b] flex place-content-center`}>
            Happy (very belated) Valentine&apos;s Day<br />
          </h2>
          
          <div className='flex place-content-center'>
            {Button({ 
              buttontext: 'Müzik kutusunu aç', 
              onClick: () => signIn('spotify', { callbackUrl: '/jukebox' })
            })}
           </div>

        </div>  
        
      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
