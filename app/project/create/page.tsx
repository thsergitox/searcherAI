/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MathJax from 'react-mathjax';
import '../create/createProject.css'

interface Article {
    title: string;
    authors: string[];
    abstract: string;
    categories: string;
    entry_id: string;
    pdf_url: string;
    published: string;
    updated: string;
}

export default function CreateProject(){
    const [currentStep, setCurrentStep] = useState(1);
    const [subject, setSubject] = useState('')
    const [enhancedQueries, setEnhancedQueries] = useState([])
    const [selectedQueries, setSelectedQueries] = useState<string[]>([])
    const [articles, setArticles] = useState<Article[]>([]);
    const [expandedAbstracts, setExpandedAbstracts] = useState<{ [key: number]: boolean }>({});

    const handleChangeStep = (step: number) =>{
        setCurrentStep(step)
    } 

    const handleSearch = async (nextStep: number) => {
        try {
            setCurrentStep(nextStep)
            const response = await fetch('http://127.0.0.1:8000/api/v1/agent/run-refinement', {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({topic: subject})
            }); 

            if (!response.ok){
                const errorData = await response.json();
                console.error(errorData.detail);
            }       

            const data = await response.json();
            console.log('data: ', data);
            setEnhancedQueries(data.data.enhanced_queries);
            

        } catch (error) {
            console.error(error)
        }
    }

    const handleAddQuery = (query:string) => {
        setSelectedQueries([...selectedQueries, query])
    }

    const handleLookForPapers = async () =>{
        try {
            setCurrentStep(3)
            const response = await fetch('http://127.0.0.1:8000/api/v1/agent/run-search', {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({max_results: 3, queries: selectedQueries, sort_by: "Relevance"})
            });

            if(!response.ok){
                const errorData = await response.json();
                console.error(errorData.detail);
            }
 
            const data = await response.json();
            console.log('data: ', data);
            setArticles(data.data)
        } catch (error) {
            console.error('error: ', error)
        }
    }

    const handleToggleAbstract = (index: number) => {
        setExpandedAbstracts((prev) => ({
            ...prev,
            [index]: !prev[index], 
        }));
    };


    return(<div className='steps-container'>
       <div className='steps-count'>
        <div className="step"> 
            <span  className={currentStep === 1 ? 'active' : ''}>1</span>
            <p>Step 1</p>
        </div>
        <div className={`to-step ${currentStep === 1 ? 'active': 'completed'}`}></div>
        <div className="step">
            <span className={currentStep === 2 ? 'active' : ''}>2</span>
            <p>Step 2</p>
        </div>
        <div className={`to-step ${currentStep === 2 ? 'active': currentStep === 3 ? 'completed' : ''}`}></div>
        <div className="step">
            <span className={currentStep === 3 ? 'active' : ''}>3</span>
            <p>Step 3</p>
        </div>
       </div>
       <div className='step-content'>
            {currentStep === 1 && <>
            <div>¿Sobre qué quieres investigar hoy?</div>
            <Input 
              placeholder='e.g: quantum computing applications in cryptography' 
              onChange = {(e) => setSubject(e.target.value)}/> 
            <div>
                <Button onClick={() => handleSearch(2)}>Buscar</Button>
            </div>
            </>}
            {currentStep === 2 && <>
            <div>¿En qué temas quieres profundizar?</div> 
                {enhancedQueries.length>1 ? (
                    <>
                    <ul>
                        {enhancedQueries.map((query: string, index: number) => (
                            <li key={index}><a href="#" onClick={() => handleAddQuery(query)}>{query}</a></li>
                        ))}
                    </ul>
                    <Button onClick={() => handleLookForPapers()}> Buscar Papers </Button>
                    </>
                ) : (
                    <p>Cargando resultados...</p>
                )}
            </>}
            {currentStep === 3 && 
            <><MathJax.Provider>
                    <h2>Artículos relacionados</h2>
                    {articles.length ? (
                        <ul className="article-list">
                            {articles.map((article, index) => (
                                <li key={index} className="article-item">
                                    <h3>{article.title}</h3>
                                    <p><strong>Autores:</strong> {article.authors.join(', ')}</p>
                                    <p><strong>Publicado:</strong> {article.published}</p>
                                    <p><strong>Categoría:</strong> {article.categories}</p>
                                    <MathJax.Node>
                                        {expandedAbstracts[index]
                                            ? article.abstract 
                                            : `${article.abstract.slice(0, 200)}...`} 
                                        <button onClick={() => handleToggleAbstract(index)}>
                                            {expandedAbstracts[index] ? 'Leer menos' : 'Leer más'}
                                        </button>
                                    </MathJax.Node>
                                    <a
                                        href={article.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="article-link"
                                    >
                                        Leer PDF
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Cargando artículos.</p>
                    )}
            </MathJax.Provider>
            </>}
       </div>
    </div>)
}