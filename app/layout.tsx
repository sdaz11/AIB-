import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'AEGIS 2.0 | Governed Fraud Intelligence',description:'AEGIS 2.0: governed fraud investigation demonstration with deterministic Python-policy-aligned risk scoring.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
