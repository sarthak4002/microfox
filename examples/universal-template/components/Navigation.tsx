import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="navigation">
      <ul>
        <li className={currentPath === '/' ? 'active' : ''}>
          <Link href="/">Reddit SDK</Link>
        </li>
        <li className={currentPath === '/github' ? 'active' : ''}>
          <Link href="/github">GitHub SDK</Link>
        </li>
      </ul>

      <style jsx>{`
        .navigation {
          background-color: #f8f9fa;
          padding: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e9ecef;
        }
        
        ul {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        li {
          margin-right: 1.5rem;
        }
        
        li a {
          text-decoration: none;
          color: #495057;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
        }
        
        li.active a {
          color: #0070f3;
        }
        
        li.active a:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #0070f3;
        }
        
        li a:hover {
          color: #0070f3;
        }
      `}</style>
    </nav>
  );
} 