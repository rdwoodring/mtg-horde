import { useCallback } from "react"

type Props = {
    id: string,
    handleClickX: (id: string) => void,
    children: React.ReactNode
}

function RemoveX(props: Props) {
    const {
        id,
        handleClickX,
        children
    } = props,
    handleClickXWrapped = useCallback(() => {
        handleClickX(id);
    }, [handleClickX, id]);

    return (
        <div style={{
            position: 'relative'
        }}>
            <button 
                onClick={handleClickXWrapped}
                style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    marginRight: '-12px',
                    marginTop: '-12px',
                    borderRadius: '50%',
                    backgroundColor: 'cornflowerblue',
                    height: '24px',
                    width: '24px',
                    padding: '0',
                    textAlign: 'center',
                    boxShadow: '-5px 5px 10px',
                    background: 'white',
                    borderColor: 'black'
                }}
            >
                <div>
                    X
                </div>
            </button>
            {children}
        </div>
    )
}

export default RemoveX;
export type {
    Props
}