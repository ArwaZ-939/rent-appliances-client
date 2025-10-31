import React ,{useState } from 'react';

const DarkMode = () => {
    const [darkMode, setDarkMode] = useState(false);


  return (
    <div class={`container-fluid ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{height:'100%'}}>
        <p>
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
        </p>
        <button class="btn btn-secondary rounded-pill" onClick={() => setDarkMode(false)}>
        ☀️
        </button>
        &nbsp;&nbsp;
        <button class="btn btn-secondary ml-2 rounded-pill" onClick={() => setDarkMode(true)}>
        🌙
        </button>

      <div className={`container-fluid ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
</div>
</div>
  );
};

export default DarkMode;