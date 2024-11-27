/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import '../create/createProject.css'
import { CircleCheck, SquareCheckBig } from 'lucide-react'
import LoginForm from '@/components/login-form'

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
    const [nextStep, setNextStep] = useState(2);
    const [subject, setSubject] = useState('');
    const [enhancedQueries, setEnhancedQueries] = useState([]);
    const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [expandedAbstracts, setExpandedAbstracts] = useState<{ [key: number]: boolean }>({});
    const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleChangeStep = (step: number) =>{
        setCurrentStep(step)
    } 

    const handleSearch = async (nextStep: number) => {
        try {
            setCurrentStep(nextStep)
            const response = await fetch('https://back-searcherai-production.up.railway.app/api/v1/agent/run-refinement', {
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
            setNextStep(3)

        } catch (error) {
            console.error(error)
        }
    }

    const handleToggleAddQuery = (query:string) => {
        if (selectedQueries.indexOf(query,0) > -1 ){
            selectedQueries.splice(selectedQueries.indexOf(query), 1);
            setSelectedQueries([...selectedQueries])
        }
        else{
            setSelectedQueries([...selectedQueries, query])
        }
    }

    const handleLookForPapers = async () =>{
        try {
            setCurrentStep(3)
            const response = await fetch('https://back-searcherai-production.up.railway.app/api/v1/agent/run-search', {
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
            setNextStep(0)
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

    const handleToggleAddSelectedArticle = (index:number) => {
        if(selectedArticles.indexOf(articles[index], 0) > -1){
            selectedArticles.splice(selectedArticles.indexOf(articles[index]), 1);
            setSelectedArticles([...selectedArticles])
        }
        else{
            setSelectedArticles([...selectedArticles, articles[index]])
        }
        console.log('selectedArticles: ', selectedArticles)
    }

    const isUserLogged = () => {
        return false
    }

    const sendSelectedArticles = () =>{
        if (!isUserLogged()){
            setIsModalOpen(true);
        }
    }

    const closeModal = () => {
        setIsModalOpen(false);
      };

    return(<div className='steps-container'>
       <div className='steps-count'>
        <div className="step"> 
            <span  className={currentStep === 1 ? 'active' : 'completed'}>1</span>
            <p>Step 1</p>
        </div>
        <div className={`to-step ${currentStep === 1 && nextStep === 2? 'active': 'completed'}`}></div>
        <div className="step">
            <span className={currentStep === 2 ? 'active' : currentStep === 3 ? 'completed' : ''}>2</span>
            <p>Step 2</p>
        </div>
        <div className={`to-step ${currentStep === 2  && nextStep === 3? 'active': currentStep === 3 ? 'completed' : ''}`}></div>
        <div className="step">
            <span className={currentStep === 3 ? 'active' : ''}>3</span>
            <p>Step 3</p>
        </div>
       </div>
       <div className='step-content'>
            {currentStep === 1 && <>
            <div className='step-title'>¿Sobre qué quieres investigar hoy?</div>
            <Input 
              placeholder='e.g: quantum computing applications in cryptography' 
              onChange = {(e) => setSubject(e.target.value)}/>
            <div>
                <Button variant={'important'} onClick={() => handleSearch(2)}>Buscar</Button>
            </div>
            </>}
            {currentStep === 2 && <>
            <div className='step-title'>¿En qué temas quieres profundizar?</div> 
                {enhancedQueries.length>1 ? (
                    <>
                    <ul className='enhanced-queries-list'>
                        {enhancedQueries.map((query: string, index: number) => (
                            <li className={`enhanced-queries-item ${selectedQueries.indexOf(query) != -1 ? 'selected' : ''}`} key={index}><a href="#" onClick={() => handleToggleAddQuery(query)}>{query}</a>{ selectedQueries.indexOf(query) != -1 && <SquareCheckBig size={16} strokeWidth={3} color='white'/> }</li>
                        ))}
                    </ul>
                    <Button variant={'important'} onClick={() => handleLookForPapers()}> Buscar Papers </Button>
                    </>
                ) : (
                    <p>Cargando resultados...</p>
                )}
            </>}
            {currentStep === 3 && 
            <>
                    <div className='step-title'>Artículos relacionados</div>
                    {articles.length ? (<>
                        <ul className="article-list">
                            {articles.map((article, index) => (
                                <li key={index} className="article-item">
                                    <div className='article-header'>
                                    <h3>{article.title}</h3>
                                    </div>
                                    <p><strong>Autores:</strong> {article.authors.join(', ')}</p>
                                    <p><strong>Publicado:</strong> {article.published}</p>
                                    <p><strong>Categoría:</strong> {article.categories}</p>
                                    <p>
                                        {expandedAbstracts[index]
                                            ? article.abstract + " "
                                            : `${article.abstract.slice(0, 200)}... `} 
                                        <button onClick={() => handleToggleAbstract(index)}>
                                            {expandedAbstracts[index] ? 'Leer menos' : 'Leer más'}
                                        </button>
                                    </p>
                                    <div className='article-buttons'>
                                        <Button variant={'important'} onClick={() => handleToggleAddSelectedArticle(index)}> {selectedArticles.indexOf(article) > -1 ? 'Retirar de la lista' : 'Añadir artículo'}</Button>
                                        <Button
                                            variant={'secondary'}
                                            onClick={() => {window.open(article.pdf_url);}}
                                        >
                                            Leer PDF
                                        </Button>
                                        {selectedArticles.indexOf(article) > -1 ? (<div className='article-added'><p className='added-article'>Artículo añadido a la lista</p> <CircleCheck size={12} color="#75B033" /></div>) : ''}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Button variant={'important'} onClick={() => sendSelectedArticles()}>Generar Survey Paper</Button></>
                    ) : (
                        <p >Cargando artículos...</p>
                    )}
            </>}
       </div>
       {isModalOpen && (
        <div className='modal-overlay'>
            <LoginForm></LoginForm>
        </div>
      )}
    </div>)
}