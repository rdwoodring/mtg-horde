type Props = {
    id: string,
    imageUri?: string
}

function CardImage(props: Props) {
    const {
        imageUri = 'https://placehold.co/146x204'
    } = props;

    return (
        <img src={imageUri} style={{
            width: '146px',
            height: '204px'
        }} />
    )
}

export default CardImage;
export type {
    Props
}