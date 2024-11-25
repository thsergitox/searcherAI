'use client'

import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import '../create/createProject.css'

export default function CreateProject(){
    const [subject, setSubject] = useState('')
    
    const handleSearch = () => {
        
    }
    

    return(<div className='steps-container'>
    <div className='col-3 left-col py-10 active'>
        <span className='col-num'><p>1</p></span>
            <CardHeader>
                <CardTitle>¿Sobre qué quieres investigar?</CardTitle>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder="e.g: quantum computing applications in cryptography"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    />
            </CardContent>
            <Button onClick={handleSearch}>Buscar</Button>
    </div>
    <div className="col-3 py-10">
        <span className='col-num'><p>2</p></span>
        <CardHeader>
            <CardTitle>¿Qué temas específicos te interesan?</CardTitle>
            <CardDescription>Selecciona los temas de tu interés</CardDescription>
        </CardHeader>
        <CardContent>

        </CardContent>
    </div>
    <div className="col-3 py-10">
    <span className='col-num'><p>3</p></span>
        <CardHeader>
            <CardTitle>Selecciona los papers de tu interés</CardTitle>
        </CardHeader>
        <CardContent>

        </CardContent>
    </div>
    </div>)
}