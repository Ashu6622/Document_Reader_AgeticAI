'use client'

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from './page.module.css';

function Page(){

  const router = useRouter();
  const [selectFile, setSelectedFile] = useState(null);
  const [isloading, setisLoading] = useState(false);

  async function handleDocument(){

    try{
        setisLoading(true);
        const response = await fetch(`/api/uploadDoc`, {
        method:'POST',
        body: selectFile
      })
      const result = await response.json();
      console.log(result);

      setTimeout(()=>{
        return router.replace('/chat_bot');
      }, 10000)

    }
    catch(error){
        console.log(error.message);
    }
    finally{
      setTimeout(()=>{
          setisLoading(false);
    }, 10000)
    }
  
  }

  function handleUpload(e){
        const file = e.target.files[0];
        // console.log(file);
        const formdata = new FormData();
        formdata.append("file", file);
        setSelectedFile(formdata);

        
  }

  return(
    <div className={styles.container}>
      <h1 className={styles.title}>Company Chat Bot</h1>
      <h2 className={styles.subtitle}>Upload document in PDF form</h2>

      <div className={styles.uploadSection}>
          <input 
            type='file' 
            accept=".pdf" 
            onChange={handleUpload}
            className={styles.fileInput}
          />
          <button 
            onClick={handleDocument} 
            disabled={!selectFile || isloading}
            className={styles.confirmButton}
          >
            {isloading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Processing...
              </div>
            ) : (
              'Confirm Upload'
            )}
          </button>
      </div>
    </div>
  )
}


export default Page