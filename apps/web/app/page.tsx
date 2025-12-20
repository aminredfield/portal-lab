// Redirect from the root of the site to the login page. This file runs on the
// server and uses the Next.js redirect helper.
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}