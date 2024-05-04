import { createRoot } from "react-dom/client";
import React, { useInsertionEffect, lazy } from "react";
import store from "./store.js";
import { Provider } from "react-redux";
import { Suspense } from "react";
import Counter from './features/counter/counter.jsx';

// const Counter = lazy(() =>
//   import(/* webpackChunkName: "lazy_chunk" */ "./features/counter/counter.jsx")
// );

if (process.env.NODE_ENV !== "production") {
  console.log("Looks like we are in development mode!");
}

function Index() {
  useInsertionEffect(() => {
    // css-in-js 插入时机，避免样式闪烁，因为此时处于 dom 未更新
    console.log("before mutaion 阶段 -- new code from myfeature");
    console.log("before mutaion 阶段 -- new - 2 code from myfeature");
  }, []);

  return (
    <div>
      <Suspense fallback={<div>loading</div>}>
        <Counter />
      </Suspense>
    </div>
  );
}

// function Index(){
//     const refObj = React.useRef(null);
//     const [num, setNumber] = useState(0);
//     useEffect(()=>{
//         const handler = ()=>{
//             console.log('事件监听')
//         }
//         refObj.current.addEventListener('click',handler)
//         return () => {
//             refObj.current.removeEventListener('click',handler)
//         }
//     },[])
//     const handleClick = ()=>{
//        console.log('冒泡阶段执行');
//        setNumber(num=> num + 1 ) // num = 1
//         setNumber(num=> num + 2 ) // num = 3
//         setNumber(num=> num + 3 ) // num = 6

//     }
//     const handleCaptureClick = ()=>{
//        console.log('捕获阶段执行')
//     }

//     const handleParentClick = ()=>{
//         console.log('parent  -》 冒泡阶段执行')
//      }

//      const handleParentCaptureClick = ()=>{
//         console.log('parent  -》 捕获阶段执行')
//      }

//     return  <div onClick={handleParentClick} onClickCapture={handleParentCaptureClick}>
//         num: {num}
//         <button ref={refObj} onClick={handleClick} onClickCapture={handleCaptureClick} >点击</button>
//     </div>
// }

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <Index />
  </Provider>
);
