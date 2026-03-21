"use client";

import React from 'react';
import Link from 'next/link';
import './InfoLayout.css';

export default function InfoLayout({ title, subtitle, children }) {
  return (
    <div className="info-layout-container">
      <div className="info-layout-blob top-right"></div>
      <div className="info-layout-blob bottom-left"></div>
      
      <div className="info-card">
        <header className="info-header">
          <Link href="/">
            <img src="/assets/logo_transparent.png" alt="Logo" className="info-logo" />
          </Link>
          <h1 className="info-title">{title}</h1>
          {subtitle && <p className="info-subtitle">{subtitle}</p>}
        </header>

        <main className="info-content">
          {children}
        </main>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="info-back-button">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
