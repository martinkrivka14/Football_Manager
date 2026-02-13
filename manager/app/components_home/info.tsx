interface InfoProps {
    name: string
    info: string 
  } 

export default function Info(props: InfoProps) {
    return(
      
    <div className="text-center mb-36">
        <h1 className="mb-4 text-5xl font-bold text-white  dark:text-zinc-200">
          {props.name}
        </h1>
        <p className="mb-8 text-white dark:text-zinc-400">
          {props.info}

          
        </p>
      </div>
    );
}