import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import paypal from '@paypal/checkout-server-sdk'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await request.json()
    const amount = planId === 'annual' ? '108.00' : '19.00' // USD

    if (!process.env.PAYPAL_CLIENT_ID) {
      console.warn("⚠️ PAYPAL_CLIENT_ID is missing. Defaulting to mock success for MVP dev.")
      const admin = createAdminClient()
      await admin.from('profiles').update({ plan: planId }).eq('id', user.id)
      return Response.json({ status: 'mock_success', message: 'PayPal keys missing. Simulating upgrade.', url: '/dashboard' })
    }

    const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    const client = new paypal.core.PayPalHttpClient(environment)

    const req = new paypal.orders.OrdersCreateRequest()
    req.prefer("return=representation")
    req.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: amount },
        custom_id: `${user.id}_${planId}`
      }]
    })

    const order = await client.execute(req)
    return Response.json({ id: order.result.id })

  } catch (error) {
    console.error('PayPal Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
