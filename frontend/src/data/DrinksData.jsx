import DummyImage from '../assets/image/dummy.png'
import MatchaImage from '../assets/image/matcha.png'
import MinecraftImage from '../assets/image/minecraft-cake.webp'

const DrinksData = [
    {
        id: 1,
        name: "Cookies and Cream",
        price: 55,
        imagePath: DummyImage,
        category: 'drinks',
    },
    {
        id: 2,
        name: "Matcha in the Morning",
        price: 50,
        imagePath: MatchaImage,
        category: 'drinks'
    },
    {
        id: 3,
        name: "Minecraft Cake",
        price: 250,
        imagePath: MinecraftImage,
        category: 'cakes'
    },
];

export default DrinksData;