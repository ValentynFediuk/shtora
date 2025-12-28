import Link from 'next/link'
import { CheckCircle, Package, Mail, Phone, ArrowRight } from 'lucide-react'

interface SuccessPageProps {
  searchParams: {
    order?: string
    session_id?: string
  }
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.order || 'SHTORA-XXXXX'

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">
            Дякуємо за замовлення!
          </h1>

          {/* Order number */}
          <p className="mb-2 text-secondary-600">
            Номер вашого замовлення:
          </p>
          <p className="mb-8 text-2xl font-bold text-primary-600">{orderNumber}</p>

          {/* Info */}
          <div className="mb-8 rounded-xl bg-secondary-50 p-6 text-left">
            <h2 className="mb-4 font-semibold">Що далі?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="font-medium">Підтвердження на email</p>
                  <p className="text-sm text-secondary-600">
                    Ми надіслали деталі замовлення на вашу електронну пошту
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="font-medium">Дзвінок менеджера</p>
                  <p className="text-sm text-secondary-600">
                    Наш менеджер зв&apos;яжеться з вами протягом 30 хвилин для підтвердження
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="font-medium">Відправка замовлення</p>
                  <p className="text-sm text-secondary-600">
                    Після підтвердження ми відправимо замовлення протягом 1-2 робочих днів
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="mb-8 rounded-xl border border-secondary-200 bg-white p-6">
            <h3 className="mb-3 font-semibold">Виникли питання?</h3>
            <p className="mb-4 text-secondary-600">
              Зв&apos;яжіться з нами будь-яким зручним способом:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0800123456"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <Phone className="h-4 w-4" />
                0 800 123 456
              </a>
              <a
                href="mailto:info@shtora.ua"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <Mail className="h-4 w-4" />
                info@shtora.ua
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="btn-primary flex items-center justify-center gap-2"
            >
              Продовжити покупки
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-outline">
              На головну
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
