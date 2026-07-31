import os

def process_file(in_path, out_path, title):
    with open(in_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    start_tag = '<article'
    end_tag = '</article>'
    
    start_idx = html.find(start_tag)
    end_idx = html.find(end_tag)
    
    if start_idx == -1 or end_idx == -1:
        print(f'Article not found in {in_path}')
        return
        
    content = html[start_idx:end_idx + len(end_tag)]
    
    # Replace HostelNama with LiviSync
    content = content.replace('HostelNama', 'LiviSync')
    content = content.replace('hostelnama.com', 'livisync.me')
    content = content.replace('support.hostelnama@gmail.com', 'support@livisync.me')
    
    # We will use dangerouslySetInnerHTML, escape backticks
    content = content.replace('`', '\\`')
    
    # Use standard react layout
    react_code = f"""import React from 'react';
import {{ Link }} from 'react-router-dom';
import {{ sectionTitleStyle }} from '../styles/commonStyles';

export const {title} = () => {{
  return (
    <div className="card" style={{ padding: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ ...sectionTitleStyle, fontSize: '2rem' }}>{title.replace('Of', ' of ')}</h1>
      </div>
      
      <div dangerouslySetInnerHTML={{ __html: `{content}` }} />
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}};
"""
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(react_code)
    print(f'Wrote {out_path}')

terms_in = r'C:\Users\hp\.gemini\antigravity-ide\brain\4bd36c88-7439-4377-bba8-6dc60701c027\.system_generated\steps\1705\content.md'
privacy_in = r'C:\Users\hp\.gemini\antigravity-ide\brain\4bd36c88-7439-4377-bba8-6dc60701c027\.system_generated\steps\1708\content.md'

process_file(terms_in, r'd:\LiviSync\livisync\src\components\TermsOfService.tsx', 'TermsOfService')
process_file(privacy_in, r'd:\LiviSync\livisync\src\components\PrivacyPolicy.tsx', 'PrivacyPolicy')
