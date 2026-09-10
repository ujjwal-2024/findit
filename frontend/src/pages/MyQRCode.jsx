import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../hooks/useAuth'
import { Download, Printer, Shield } from 'lucide-react'

export default function MyQRCode() {
  const { user } = useAuth()
  const qrRef = useRef()

  const foundUrl = `${window.location.origin}/found/${user?.id}`

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
      const a = document.createElement('a')
      a.download = `findit-qr-${user?.name}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const printQR = () => {
    const printWindow = window.open('', '_blank')
    const svg = qrRef.current.querySelector('svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    printWindow.document.write(`
      <html>
        <head><title>FindIt QR Code — ${user?.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:16px;">
          <h2 style="color:#0F172A;margin:0;">FindIt</h2>
          <p style="color:#475569;margin:0;font-size:14px;">Scan to return this item to its owner</p>
          ${svgData}
          <p style="color:#0F172A;font-weight:600;margin:0;">${user?.name}</p>
          <p style="color:#475569;font-size:12px;margin:0;">${user?.email}</p>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `)
  }

  if (!user) return (
    <div className="text-center py-20 text-slate-400">Please log in to view your QR code.</div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">My QR Code</h1>
      <p className="text-slate-500 text-sm mb-8">
        Print this QR code and stick it on your belongings. If someone finds your item, they scan it and can contact you instantly.
      </p>

      {/* QR Code */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mb-6" ref={qrRef}>
        <QRCodeSVG
          value={foundUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#0F172A"
          level="H"
          style={{ margin: '0 auto', display: 'block' }}
        />
        <p className="text-slate-900 font-semibold mt-4">{user?.name}</p>
        <p className="text-slate-500 text-xs mt-1">Scan to contact owner</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <button onClick={downloadQR}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 text-sm">
          <Download className="h-4 w-4" /> Download PNG
        </button>
        <button onClick={printQR}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 text-sm">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* How to use */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900 text-sm">How to use</h2>
        </div>
        <ol className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> Download or print your QR code</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> Stick it on your bag, laptop, wallet, keys, or any valuable item</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> If someone finds your item, they scan the QR code</li>
          <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> They land on your contact page and can reach you instantly</li>
        </ol>
      </div>
    </div>
  )
}