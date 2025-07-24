// File: src/features/hauler/admin/components/webcards/webcards.comp.tsx
// Účel: Pod-sekcia pre správu Webových Vizitiek, ktorá importuje dáta z externého súboru.

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebCard, mockWebCards, AVAILABLE_MODULES } from '@/data/mockWebCardsData';
import './webcards.comp.css';

const WebCardsComponent: React.FC = () => {
    const [cards, setCards] = useState<webCard[]>(mockWebCards);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<webCard | null>(null);

    const openEditorForNew = () => {
        setEditingCard(null);
        setIsEditorOpen(true);
    };

    const openEditorForEdit = (card: WebCard) => {
        setEditingCard(card);
        setIsEditorOpen(true);
    };
    
    return (
        <div className="webcards">
            <div className="webcards__header">
                <h1 className="webcards__title">Webové Vizitky</h1>
                <button className="button button--primary" onClick={openEditorForNew}>+ Nová Stránka</button>
            </div>
            
            <div className="webcards__grid">
                {cards.map(card => (
                    <div key={card.id} className="webcard">
                        <div className="webcard__header">
                            <span className="webcard__name">{card.name}</span>
                            <span className={`webcard__status webcard__status--${card.status.toLowerCase().replace(/ /g, '-')}`}>{card.status}</span>
                        </div>
                        <a href={`https://${card.customDomain || (card.subDomain ? `${card.subDomain}.${card.domain}` : card.domain)}`} target="_blank" rel="noopener noreferrer" className="webcard__domain">
                            {card.customDomain || (card.subDomain ? `${card.subDomain}.${card.domain}` : card.domain)}
                        </a>
                        <div className="webcard__stats">
                            <span>Videnia: {card.views}</span>
                            <span>Moduly: {card.modules.length}</span>
                        </div>
                        <div className="webcard__actions">
                            <button className="button button--small" onClick={() => openEditorForEdit(card)}>Upraviť</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isEditorOpen && (
                    <motion.div className="editor-modal__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="editor-modal__content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                            <h3>{editingCard ? 'Upraviť stránku' : 'Nová stránka'}</h3>
                            <form>
                                {/* Formulár na úpravu/tvorbu (v príprave)... */}
                                <p>Tu bude formulár s poliami pre názov, doménu, moduly atď.</p>
                                <div className="editor-modal__actions">
                                    <button type="button" className="button" onClick={() => setIsEditorOpen(false)}>Zavrieť</button>
                                    <button type="submit" className="button button--primary">Uložiť</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </>
        </div>
    );
};

export default WebCardsComponent;