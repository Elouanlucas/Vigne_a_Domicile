import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Prestations.css';

function Prestations() {
    return (
        <div className="prestations-container">
            <div className="prestations-header">
                <h1>Nos Prestations</h1>
            </div>
            <div className="prestations-list">
                {/* Exemple de prestation */}
                <p>Découvrez nos services de coiffure, de soins du visage et de manucure pour une expérience de beauté complète.</p>
            </div>
        </div>
    );
}

export default Prestations;