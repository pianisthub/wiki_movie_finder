import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchWord, setSearchWord] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const url = 'https://en.wikipedia.org/w/api.php';
    const pageTitle = 'List_of_American_films_of_2007';
  
    const searchParams = {
      action: 'parse',
      page: pageTitle,
      format: 'json',
      origin: '*',
    };
  
    try {
      const { data } = await axios.get(url, { params: searchParams });
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(data.parse.text['*'], 'text/html');
      const tables = htmlDoc.querySelectorAll('table.wikitable');
      const extractedLinks = [];
  
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row) => {
          const link = row.querySelector('td i a');
          if (link) {
            extractedLinks.push(link.getAttribute('href'));
          }
        });
      });
  
      setLinks(extractedLinks);
    } catch (error) {
      console.error('Error fetching links', error);
    }
  };
  

  const chunkArray = (arr, chunkSize) => {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  };
  
  const fetchWikiData = async () => {
    setSearchResult([]);
    const url = 'https://en.wikipedia.org/w/api.php';
    const foundPages = [];
  
    const chunkedLinks = chunkArray(links, 20);
  
    for (const chunk of chunkedLinks) {
      const pageTitles = chunk.map((link) => link.replace('/wiki/', '')).join('|');
  
      const searchParams = {
        action: 'query',
        titles: pageTitles,
        prop: 'revisions',
        rvprop: 'content',
        format: 'json',
        origin: '*',
      };
  
      try {
        const { data } = await axios.get(url, { params: searchParams });
        const pages = data.query.pages;
  
        for (const pageId in pages) {
          const pageContent = pages[pageId].revisions[0]['*'];
  
          if (pageContent.toLowerCase().includes(searchWord.toLowerCase())) {
            foundPages.push(pages[pageId].title);
          }
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    }
  
    setSearchResult(foundPages);
  };
  
  
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchWikiData();
  };

  return (
    <div className="container">
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search for a word"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />
        <button className="search-button" onClick={fetchWikiData}>
          Search
        </button>
      </div>
      <ul className="result-list">
        {searchResult.length === 0 && (
          <li className="result-item no-result">No results found</li>
        )}
        {searchResult.map((result, index) => (
          <li className="result-item" key={index}>
            {result}
          </li>
        ))}
      </ul>
    </div>
  );
  
}

export default App;
