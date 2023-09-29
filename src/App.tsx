import { useCallback, useState } from 'react'
import './App.css';

import useSwr from 'swr';
import useSwrImmutable from 'swr/immutable'
import axios from 'axios';
import {
    v4
} from 'uuid';

import {
    Card, CardFace
} from 'scryfall-sdk'

import CardImage from './CardImage';
import RemoveX, {
    Props as RemoveXProps
} from './RemoveX';

function useZombieTokenCards() {
    const fetchZombieTokenCards = () => {
        return axios.get<{data: Array<Card>}>('https://api.scryfall.com/cards/search?q=zombie+type:token+-is:funny+power%3e0+tou%3e0')
            .then((res) => res.data.data)
        
    };

    const {isLoading, data} = useSwrImmutable<Array<Card>>('zombieTokens', fetchZombieTokenCards);

    return {
        loading: isLoading,
        cards: data || []
    };

}

function useRandomZombieCard(wave: number) {
    const fetchRandomZombieCard = useCallback(() => {
        return axios.get<Card>('https://api.scryfall.com/cards/random?q=zombie+color:black+-t:token+-is:funny')
            .then(res => res.data);
    }, [])

    const {isLoading, data} = useSwr<Card>(`zombieNonToken-${wave}`, fetchRandomZombieCard, {
        revalidateOnFocus: false
    });

    return {
        loading: isLoading,
        cards: data ? [data] : []
    }
}

function App() {

    const [wave, setWave] = useState(0);
    const [playedCards, setPlayedCards] = useState(0);
    const {
        loading: loadingZombieTokens,
        cards: zombieTokens
    } = useZombieTokenCards();

    const {
        loading: loadingNonTokenZombie,
        cards: zombie
    } = useRandomZombieCard(wave)

    const zombiePercentage = 60;

    const maxCards = 100;

    const [selectedZombieTokens, setSelectedZombieTokens] = useState<Record<string, Card>>({});

    const handleClickGenerateHorde = useCallback(() => {
        let rolledNumber = Math.floor(Math.random() * 100);

        let zombieTokenBuffer: Array<Card> = [];

        while(rolledNumber < zombiePercentage && playedCards + zombieTokenBuffer.length < maxCards) {
            const zombieIndex = Math.floor(Math.random() * zombieTokens.length);

            zombieTokenBuffer = [
                ...zombieTokenBuffer,
                zombieTokens[zombieIndex]
            ];

            rolledNumber = Math.floor(Math.random() * 100);
        } 

        zombieTokenBuffer = [
            ...zombieTokenBuffer,
            ...zombie
        ];

        setPlayedCards((currentPlayedCardsCount) => currentPlayedCardsCount + zombieTokenBuffer.length);

        setSelectedZombieTokens((currentlySelectedZombies) => {
            return {
                ...currentlySelectedZombies,
                ...zombieTokenBuffer.reduce((acc: typeof selectedZombieTokens, zombieToken) => {
                    return {
                        ...acc,
                        [v4()]: zombieToken
                    }
                }, {})
            }
        });

        setWave((currentWave) => currentWave + 1);
    }, [playedCards, zombie, zombieTokens]);

    const handleRemoveZombie = useCallback<RemoveXProps['handleClickX']>((zombieId) => {
        setSelectedZombieTokens((currentlySelectedZombies) => {
            const {
                [zombieId]: _removed,
                ...rest
            } = currentlySelectedZombies;

            return rest;
        })
    }, []);

    const getImageUris = (card: Card | CardFace): string | undefined => {
        const image = card.image_uris?.small ||
            card.image_uris?.normal ||
            card.image_uris?.png ||
            card.image_uris?.large ||
            card.image_uris?.art_crop ||
            card.image_uris?.border_crop;

            if (!image && 'card_faces' in card) {
                return card?.card_faces?.reduce((acc: string | undefined, cardFace) => {
                    return acc || getImageUris(cardFace);
                }, '')
            }

        return image; 
    }

    return (
        <>
            <h1>Current Wave{wave > 0 ? `: ${wave}` : ''}</h1>
            <div>
                <div>
                    Horde Strength:
                </div>
                <div>
                    {maxCards - playedCards} / {maxCards}
                </div>
            </div>
            <button onClick={handleClickGenerateHorde} disabled={loadingNonTokenZombie || loadingZombieTokens}>
                {Object.keys(selectedZombieTokens).length ? 'The Horde Strengthens...' : 'Release the Horde'}
            </button>

            <ul style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: '1 0 0',
                columnGap: '16px',
                rowGap: '16px'
            }}>
                {Object.keys(selectedZombieTokens).sort().map((id) => {
                    const card = selectedZombieTokens[id];

                    const selectedImage = getImageUris(card);

                    return (
                        <li style={{
                            listStyle: 'none'
                        }} key={id}>
                            
                            <RemoveX id={String(id)} handleClickX={handleRemoveZombie}>
                                <CardImage imageUri={selectedImage} id={String(id)} />
                            </RemoveX>
                        </li>

                    )
                })}
            </ul>
        </>
        )
    }
    
    export default App;