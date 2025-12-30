import { redirect } from 'next/navigation'

export default function CheckoutSuccessPage() {
  // Сторінка вимкнена — редірект на головну
  redirect('/')
}
