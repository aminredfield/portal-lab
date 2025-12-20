import { redirect } from 'next/navigation';

export default function ErrorsIndexPage() {
  redirect('/app/errors/api');
}