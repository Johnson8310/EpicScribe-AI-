
import { redirect } from 'next/navigation';

export default function MyBooksRedirectPage() {
  redirect('/?tab=my-books');
}
