import { redirect } from 'next/navigation';

export default function PerfIndexPage() {
  // Redirect to the bad implementation by default. Tabs inside the page can
  // navigate to /app/perf/good.
  redirect('/app/perf/bad');
}