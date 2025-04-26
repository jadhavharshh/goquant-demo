import { Button } from '@/components/ui/button'
import React from 'react'

const page = () => {
  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center">
          <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
    <Button>Hello World</Button>
    </div>
  )
}

export default page