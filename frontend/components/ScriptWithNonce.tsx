import { headers } from 'next/headers'

interface ScriptWithNonceProps {
  src: string
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'
  children?: React.ReactNode
}

export default function ScriptWithNonce({ 
  src, 
  strategy = 'afterInteractive',
  children 
}: ScriptWithNonceProps) {
  const headersStore = headers()
  const nonce = headersStore.get('x-nonce')
  
  return (
    <script 
      nonce={nonce} 
      src={src}
      strategy={strategy}
    >
      {children}
    </script>
  )
}

// Monaco Editor Script mit Nonce
export function MonacoEditorScript() {
  return (
    <ScriptWithNonce 
      src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/loader.min.js"
      strategy="beforeInteractive"
    />
  )
}

// ConfigCat Script mit Nonce
export function ConfigCatScript() {
  return (
    <ScriptWithNonce 
      src="https://cdn-global.configcat.com/cdn/5.0.0/configcat.min.js"
      strategy="afterInteractive"
    />
  )
}
