import React, { ReactNode, useEffect, useState } from 'react';
import { useNounSeed } from '../../../wrappers/nounToken';
import { BigNumber } from 'ethers';
import { StandalonePart } from '../../StandalonePart';
import classes from './ExploreNounDetail.module.css';
import { ImageData } from '@nouns/assets';
import { Trans } from '@lingui/macro';
import {AnimatePresence, motion} from 'framer-motion/dist/framer-motion';
import { XIcon } from '@heroicons/react/solid';
import NounInfoRowBirthday from '../../NounInfoRowBirthday';
import loadingNoun from '../../../assets/loading-skull-noun.gif';
import Placeholder from 'react-bootstrap/Placeholder';
import Image from 'react-bootstrap/Image'
import cx from 'classnames';
import dotenv from 'dotenv';
dotenv.config();

type Noun = {
    id: number | null;
    imgSrc: string | undefined;
  };
interface ExploreNounDetailProps {
    nounId: number;
    noun: Noun;
    handleCloseDetail: Function;
    handleNounNavigation: Function;
    selectedNoun?: number;
    isVisible: boolean;
    handleScrollTo: Function;
    setIsKeyboardNavigating: Function;
    disablePrev: boolean;
    disableNext: boolean;
    // nounImgSrc?: string | undefined;
}

const ExploreNounDetail: React.FC<ExploreNounDetailProps> = props => {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const isMobile: boolean = width <= 991;
    const handleWindowSizeChange = () => {
        setWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);

        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        };
    }, []);

    // Modified from playground function to remove dashes in filenames
    const parseTraitName = (partName: string): string =>
        capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1).replace(/-/g, ' '));
    const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

    const traitKeyToLocalizedTraitKeyFirstLetterCapitalized = (s: string): ReactNode => {
        const traitMap = new Map([
          ['background', <Trans>Background</Trans>],
          ['body', <Trans>Body</Trans>],
          ['accessory', <Trans>Accessory</Trans>],
          ['head', <Trans>Head</Trans>],
          ['glasses', <Trans>Glasses</Trans>],
        ]);
        return traitMap.get(s);
      };

    const traitTypeKeys = (s: string) => {
        const traitMap = new Map([
          ['background', 'backgrounds'],
          ['body', 'bodies'],
          ['accessory', 'accessories'],
          ['head', 'heads'],
          ['glasses', 'glasses'],
        ]);
        const result = traitMap.get(s);
        if (result) {
            return result;
        } else {
            throw new Error(`Trait key for ${s} not found`);
        }
      };

    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map(i => {
        return i.map(imageData => imageData.filename);
      }),
    ];
    
    const getOrderedTraits = (seed: { head: number; glasses: number; accessory: number; body: number; background: number; }) => {
        let nounTraitsOrdered;
        const loadingNounTraits = [
            { 
                partType: 'head',
                partName: 'Skull',
                partIndex: -1,
            },
            { 
                partType: 'glasses',
                partName: 'Processing',
                partIndex: -1,
            },
            { 
                partType: 'accessory',
                partName: 'Loading',
                partIndex: -1,
            },
            { 
                partType: 'body',
                partName: 'Placeholder',
                partIndex: -1,
            },
            { 
                partType: 'background',
                partName: 'cool',
                partIndex: -1,
            },   
        ];
        if (seed) {
            nounTraitsOrdered = [
                { 
                    partType: 'head',
                    partName: parseTraitName(traitNames[3][seed.head]),
                    partIndex: seed.head,
                },
                { 
                    partType: 'glasses',
                    partName: parseTraitName(traitNames[4][seed.glasses]),
                    partIndex: seed.glasses,
                },
                { 
                    partType: 'accessory',
                    partName: parseTraitName(traitNames[2][seed.accessory]),
                    partIndex: seed.accessory,
                },
                { 
                    partType: 'body',
                    partName: parseTraitName(traitNames[1][seed.body]),
                    partIndex: seed.body,
                },
                { 
                    partType: 'background',
                    partName: parseTraitName(traitNames[0][seed.background]),
                    partIndex: seed.background,
                },   
            ];
        }
        
        if (nounTraitsOrdered) {
            return nounTraitsOrdered;
        } else {
            return loadingNounTraits;
        }
    }

    const seedId = props.noun?.id != null && props.noun?.id >= 0 ? BigNumber.from(props.noun.id) : BigNumber.from(0);
    const seed = useNounSeed(seedId);
    const bgcolors = ["#d5d7e1", "#e1d7d5"];
    const backgroundColor = seed ? bgcolors[seed.background] : bgcolors[0];
    const nounTraitsOrdered =  getOrderedTraits(seed);
    const nounId = props.noun && props.noun.id != null && props.noun.id >= 0 && props.noun.id;
    // const [isAnimating, setIsAnimating] = useState<boolean>(false);

    const handleAnimationStart = () => {
        // setIsAnimating(true);
        props.setIsKeyboardNavigating(true)
    }
    const handleAnimtionComplete = () => {
        // setIsAnimating(false);
        props.handleScrollTo(props.selectedNoun)
    }
    const motionVariants = {
        initial: {
          width: "0%"
        },
        animate: {
          width: "33%"
        },
        exit: {
          width: "0%",
        //   opacity: 0,
        //   y: "100%",
        //   x: "10vw",
        
          transition: {
            // when: "afterChildren",
            duration: 0.1
          }
        }
      };

    return (
        <>  
            <AnimatePresence>
                {isMobile && (
                    <motion.div className={classes.backdrop} initial={{opacity: 0}} animate={{opacity: 1}}></motion.div>
                )}
            </AnimatePresence>
            <motion.div 
                    className={cx(
                        classes.detailWrap, 
                        // isAnimating && classes.isAnimating
                        )}
                    style={{
                        background: backgroundColor
                    }}
                    variants={motionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    // initial={{
                    //     width: "0%"
                    // }}
                    // animate={{
                    //     width: "33%"
                    // }}
                    // exit={{
                    //     width: "0%"
                    // }}
                    onAnimationStart={() => handleAnimationStart()}
                    onAnimationComplete={() => handleAnimtionComplete()}
                >
                    <motion.div 
                        className={classes.detail}
                        style={{
                            background: backgroundColor,
                        }}
                        exit={{
                            opacity: 0,
                            // height: "50vh",
                            y: "300px",
                            transition: {
                                duration: 0.025
                            }
                        }}
                    >
                        <button className={classes.close} onClick={() => props.handleCloseDetail()}>
                            <XIcon className={classes.icon} />
                        </button>
                                    <div
                                        className={classes.detailNounImage}
                                        onClick={() => props.handleScrollTo(props.selectedNoun)}
                                    >   
                                        {nounId && seed ? (
                                            <Image 
                                                src={props.noun.imgSrc || `https://noun.pics/${props.noun.id}.svg`} 
                                                alt={`Noun ${nounId}`} 
                                            />
                                        ) : (
                                            <Image src={loadingNoun} alt="Loading noun" />
                                        )}
                                    </div>
                                    
                                    <div className={classes.nounDetails}>
                                        <div className={classes.infoWrap}>
                                            <button
                                                onClick={() => props.handleNounNavigation('prev')}
                                                className={cx(classes.arrow, backgroundColor === bgcolors[0] ? classes.arrowCool : classes.arrowWarm)}
                                                disabled={props.disablePrev}
                                                >
                                                ←
                                            </button>
                                            <div className={classes.nounBirthday}>
                                                {nounId && seed ? (
                                                    <>
                                                        <h2>Noun {nounId}</h2>
                                                        <NounInfoRowBirthday nounId={nounId} />    
                                                    </>
                                                ): (
                                                    <h2>Loading</h2>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => props.handleNounNavigation('next')}
                                                className={cx(classes.arrow, backgroundColor === bgcolors[0] ? classes.arrowCool : classes.arrowWarm)}
                                                disabled={props.disableNext}
                                            >
                                                →
                                            </button>
                                        </div>
                                        
                                        <ul className={classes.traitsList}>
                                            {nounTraitsOrdered && Object.values(nounTraitsOrdered).map((part,index) => {    
                                                const partType = traitTypeKeys(nounTraitsOrdered[index].partType);
                                                return (
                                                    <li key={partType} id={partType}>
                                                        <div 
                                                            className={classes.thumbnail}
                                                            style={{
                                                                backgroundColor: backgroundColor ? backgroundColor : 'transparent',
                                                            }}
                                                        >
                                                            <AnimatePresence>
                                                                {nounId && seed && (
                                                                    <StandalonePart partType={partType} partIndex={part.partIndex} />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                        
                                                        <div className={classes.description}>
                                                            <p className='small'>
                                                                <AnimatePresence>
                                                                    {nounId && seed ? (
                                                                        <motion.span>
                                                                            {traitKeyToLocalizedTraitKeyFirstLetterCapitalized(nounTraitsOrdered[index].partType)}
                                                                        </motion.span>
                                                                    ) : (
                                                                        <motion.span>
                                                                            <Placeholder as="span" animation="glow">
                                                                                <Placeholder xs={8} />
                                                                            </Placeholder>
                                                                        </motion.span>
                                                                    )}
                                                                </AnimatePresence>
                                                                    
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    <AnimatePresence>
                                                                        {nounId && seed ? (
                                                                            <>{nounTraitsOrdered[index].partName}</>
                                                                        ) : (
                                                                            <Placeholder xs={12} animation="glow" />
                                                                        )}
                                                                    </AnimatePresence>
                                                                </strong>
                                                            </p>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        {nounId && seed && (
                                            <p className={classes.activityLink}><a href={`/noun/${nounId}`}><Trans>Vote history</Trans></a></p>
                                        )}
                                    </div>
                    </motion.div>
            </motion.div>
        </>
    )
}


export default ExploreNounDetail;
