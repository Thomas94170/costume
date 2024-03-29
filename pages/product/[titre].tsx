import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter} from "next/router";
import { getCostumeByTitle } from "../api/api";
import { GetStaticPropsContext } from 'next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Loading from "@/components/loading";
import Footer from "@/components/footer";
import Logout from "@/components/logout";



interface Costume {
  titre: string;
  description: string;
  imageUne: string;
  imageDeux: string;
  prix: string;
}

export async function getStaticProps({ params }: GetStaticPropsContext<{ titre: string }>) {
  const costume = await getCostumeByTitle(params.titre);
  console.log(params)
  console.log(costume)
  return { props: { costume } };
  
}

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}
function Product({ costume }: {costume?:Costume}) {
  const router = useRouter();
  console.log(costume)
  const [clickCount, setClickCount] = useState(0); // Initialise le compteur de clics à 0
  const [cartItems, setCartItems] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  

  const handleAddToCart = () => {
    setClickCount(prevClickCount => prevClickCount + 1);
    const newCartItems = {
      ...cartItems,
      [costume.titre]: {
        count: (cartItems[costume.titre]?.count || 0) + 1,
        prix: costume.prix || '0',
      },
    };
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };


 

  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    setCartItems(savedCartItems);
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('cartItems'); // vider le localStorage après 10 minutes
    }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);


  const cart = Object.entries(cartItems).map(([titre, { count, prix }]) => {
    const total = count * prix;
    return (
      <div key={titre}>
        <p> <FontAwesomeIcon icon={ faShoppingCart } />{count} x {titre} ({prix}€ chacun)</p>
        <p>Total: {total}€</p>
      </div>
    );
  });


  if (router.isFallback) {
    return <Loading/>;
  }


  if (!costume) {
    return <p>Costume not found</p>;
  }
  
  const isLogged = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem("token") !== null;

  return (
    <>
    {isLogged && 
    <>
              <div>
                 <div className="flex">
                <p className="inline-block">Connecté</p>
                <span className="inline-block mt-3 ml-2"><img src="https://img.icons8.com/emoji/48/null/green-circle-emoji.png" height={10} width={10}/></span>
              </div>
              </div>
              <Logout/>
    </>
              }
    <div className="resume">
        <div className="prod1">
            <h1 className="text-center mb-3 text-2xl">{costume.titre}</h1>
            <p className="text-center">{costume.description}</p>
          <div className=" flex justify-center">
            <img className="img-product m-2" src={costume.imageUne} alt={costume.titre} />
            <img className="img-product m-2" src={costume.imageDeux} alt={costume.titre} /> 
          </div>
          <p className="text-center">{costume.prix} €/jour</p>
        </div>
        <div className="fenetre border border-black rounded-md bg-gray-200">
        <div className="flex flex-col">
            {cart}
            
            <br/>
            <br/>
            <div>
             {errorMessage && <div>{errorMessage}
            </div>}
            <button className="bg-black text-white py-2 px-4 rounded mt-4 mb-4" 
            onClick={handleAddToCart}>
              Ajouter au panier
            </button>
            <Link href='/achat'>
              <button className="bg-black text-white py-2 px-4 rounded mt-4 mb-4">
                Voir mon panier
              </button>
            </Link>
            <Link href='/location'>
              <button className="bg-black text-white py-2 px-4 rounded mt-4 mb-4">
                Ajouter d'autres articles
              </button>
            </Link>
          </div>
        </div>
</div>
    
        
      </div>
      <br/>
      <br/>
      <br/>
      <Link href='/location'>Retour</Link>
      <br/>
      <br/>
      <Footer/>
    </>
  );
}

export default Product;
