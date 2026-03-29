import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import paypal from '@paypal/checkout-server-sdk'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderID, planId } = await request.json()

    const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    const client = new paypal.core.PayPalHttpClient(environment)

    const req = new paypal.orders.OrdersCaptureRequest(orderID)
    req.requestBody({})

    const capture = await client.execute(req)

    if (capture.result.status === 'COMPLETED') {
        const admin = createAdminClient()
        await admin.from('profiles').update({ plan: planId }).eq('id', user.id)
        return Response.json({ success: true, url: '/dashboard' })
    }
    
    return Response.json({ error: 'Payment not completed'}, { status: 400 })

  } catch (error) {
    console.error('PayPal Capture Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
