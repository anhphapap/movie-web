import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Banner from './components/Banner'


library.add(fas, fab, far);

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Header />
        <Banner />
      </div>
    </>
  )
}

export default App
