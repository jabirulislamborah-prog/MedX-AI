import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await request.json()

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex')

    if (expectedSignature === razorpay_signature) {
        // Payment valid
        const admin = createAdminClient()
        await admin.from('profiles').update({ plan: planId }).eq('id', user.id)
        return Response.json({ success: true, url: '/dashboard' })
    }

    return Response.json({ error: 'Invalid signature'}, { status: 400 })

  } catch (error) {
    console.error('Razorpay Verify Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
