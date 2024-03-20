function digitButton(
    digit: number, 
    onClickFunction:  (digit:number)=> void){
    
    return(
        <div className='digit-btn-back flex'>
            <button className={`${digit}-btn digit-btn`} type='button' onClick={() => onClickFunction(digit)} >
                {digit}
            </button>
        </div>
    )
}


export default function digitBoard(onNumberChange: (newNumber: string)=>{}){

    const handleDigitClick = (digit:number) => {
        onNumberChange(digit.toString())
    };

    return (
        <div className='digitboard flex flex-row items-center justify-center'>
                {[...Array(10)].map((_, index) => (
                    <div key={index} className='digitboard-btn flex flex-col items-center justify-center'>
                        <div className='flex button-val items-center justify-center'>
                            {index}
                        </div>
                        {digitButton(index, handleDigitClick)}
                    </div>
                ))}
        </div>
    );
};