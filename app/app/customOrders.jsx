import './global.css';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, AlertCircle, Check, Upload } from 'lucide-react-native';
import FormLabel from '@/components/atoms/FormLabel';
import Dropdown from '@/components/atoms/Dropdown';
import Checkbox from '@/components/atoms/Checkbox';
import cakeImages from './cakeImages';
import DatePicker from '@/components/atoms/DatePicker';

const CustomOrders = () => {
    const [customDisplay, setCustomDisplay] = useState("");
    const router = useRouter();
    const [personallyDesign, setPersonallyDesign] = useState(false);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(10);
    const [occasion, setOccasion] = useState(null);
    const [specifyOccasion, setSpecifyOccasion] = useState('');
    const [shape, setShape] = useState(null);
    const [specifyShape, setSpecifyShape] = useState('');
    const [tier, setTier] = useState(null);
    const [baseFlavor, setBaseFlavor] = useState(null);
    const [filling, setFilling] = useState(null);
    const [coatingColor, setCoatingColor] = useState(null);
    const [border, setBorder] = useState(null);
    const [borderColor, setBorderColor] = useState(null);
    const [toppings, setToppings] = useState(null);
    const [addOn, setAddOn] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [message, setMessage] = useState('');
    const [hasCupcakes, setHasCupcakes] = useState(false);
    const [cupcakesCount, setCupcakesCount] = useState(0);
    const [cupcakesFrosting, setCupcakesFrosting] = useState(null);
    const [comments, setComments] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [image, setImage] = useState(null);
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [agreeToTOC, setAgreeToTOC] = useState(false);

    const pageTitles = [
        'Cake Details',
        'Form',
        'Flavors',
        'Coating',
        'Add-ons',
        'Message',
        'Cupcakes',
        'Comments',
        'Image',
        'Information',
    ]

    useEffect(() => {
        if (!shape && !tier) return;

        const img =
            cakeImages?.[shape || "round"]?.[tier || 1]?.[baseFlavor || "vanilla"][filling || "none"]
        // const img = cakeImages["round"][2]["vanilla"]["none"]
        //     cakeImages?.[shape]?.[tier]?.[flavor]?.[fill] ??
        setCustomDisplay(img);
    }, [shape, tier, baseFlavor, filling]);

    const handleChangePage = (direction) => {
        if (direction === 'next' && page < maxPage) {
            setPage(page + 1);
        } else if (direction === 'prev' && page > 1) {
            setPage(page - 1);
        }
    }

    const toggleHasCupcakes = () => {
        setHasCupcakes(!hasCupcakes);
    }

    const pickImage = async () => {
        // Ask permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied!");
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };


    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C] items-center justify-center'>
            <View className='h-[40vh] p-8 pt-16'>
                <View className='aspect-square h-full bg-main-form rounded-lg justify-center items-center'>
                    {customDisplay ? (
                        <Image
                            source={customDisplay}
                            style={{ width: 200, height: 200 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text className='text-sm font-semibold text-gray-300'>CAKE PREVIEW</Text>
                    )}
                </View>
            </View>

            <View className='bg-main-form w-full flex-1 rounded-t-[3rem]'>
                {/* Header */}
                <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                    <View>
                        <Text className='text-2xl font-semibold text-[#8B5A3C]'>{pageTitles[page - 1]}</Text>
                        <Text className='text-[#9A8978]'>Customize your perfect cake</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.back()}><X style={{ color: '#8B5A3C' }} /></TouchableOpacity>
                </View>

                {/* Occasion */}
                {page === 1 &&
                    <>

                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Occassion"} />
                                <Dropdown
                                    items={[
                                        { label: 'Birthday', value: 'birthday' },
                                        { label: 'Anniversary', value: 'anniversary' },
                                        { label: 'Wedding', value: 'wedding' },
                                        { label: 'Graduation', value: 'graduation' },
                                        { label: 'Other', value: 'other' },
                                    ]}
                                    placeholder={"Select an occasion"}
                                    onChangeValue={setOccasion}
                                />
                                {occasion == 'other' && <TextInput className='py-5 px-2 rounded-md border border-secondary-light mt-4' value={specifyOccasion} onChangeText={(text) => setSpecifyOccasion(text)} placeholder='Specify your occassion' />
                                }
                            </View>

                            <View className='px-8 '>
                                <View className='p-4 gap-4 border border-secondary-light bg-white rounded-md'>
                                    {/* Checkbox */}
                                    <View className='flex-row gap-2'>
                                        <Checkbox value={personallyDesign} onChange={setPersonallyDesign} />
                                        <Text className='font-medium text-secondary-strong'>Allow the baker to personally design your cake</Text>
                                    </View>

                                    {/* Disclaimer */}
                                    <View className='bg-main-form flex-row items-center p-4 gap-2 rounded-sm border border-secondary-light'>
                                        <AlertCircle style={{ color: "#8B5A3C" }} />
                                        <Text className='text-secondary-strong text-sm'>
                                            Selecting this gives the baker artistic freedom to personalize your cake based on the occassion
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                }
                {page === 2 &&
                    <>
                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Shape"} />
                                <Dropdown
                                    items={[
                                        { label: 'Square', value: 'square' },
                                        { label: 'Round', value: 'round' },
                                        { label: 'Sheet', value: 'sheet' },
                                        { label: 'Other', value: 'other' },
                                    ]}
                                    placeholder={"Select shape"}
                                    onChangeValue={setShape}
                                />
                                {shape == 'other' && <TextInput className='py-5 px-2 rounded-md border border-secondary-light mt-4' value={specifyShape} onChangeText={(text) => setSpecifyShape(text)} placeholder='Specify your shape' />

                                }
                            </View>

                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Cake Tier"} />
                                <Dropdown
                                    items={[
                                        { label: '1-Tier', value: 1 },
                                        { label: '2-Tier', value: 2 },
                                        { label: '3-Tier', value: 3 },
                                    ]}
                                    placeholder={"Select tier"}
                                    onChangeValue={setTier}
                                />
                            </View>
                        </View>
                    </>
                }
                {page === 3 &&
                    <>
                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Base Flavor"} />
                                <Dropdown
                                    items={[
                                        { label: 'Chocolate', value: 'choco' },
                                        { label: 'Strawberry', value: 'strawberry' },
                                        { label: 'Vanilla', value: 'vanilla' },
                                    ]}
                                    placeholder={"Select base flavor"}
                                    onChangeValue={setBaseFlavor}
                                />
                            </View>

                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Filling"} />
                                <Dropdown
                                    items={[
                                        { label: 'Chocolate', value: 'choco' },
                                        { label: 'Strawberry', value: 'strawberry' },
                                        { label: 'Vanilla', value: 'vanilla' },
                                    ]}
                                    placeholder={"Select filling"}
                                    onChangeValue={setFilling}
                                />
                            </View>
                        </View>
                    </>
                }
                {page === 4 &&
                    <>
                        <View className='py-6 justify-evenly flex-1'>
                            <View className='px-8'>
                                <FormLabel text={"Coating Color"} />
                                <Dropdown
                                    items={[
                                        { label: 'Chocolate', value: 'choco' },
                                        { label: 'Strawberry', value: 'strawberry' },
                                        { label: 'Vanilla', value: 'vanilla' },
                                    ]}
                                    placeholder={"Select coating color"}
                                    onChangeValue={setCoatingColor}
                                />
                            </View>
                            <View className='px-8'>
                                <FormLabel text={"Border"} />
                                <Dropdown
                                    items={[
                                        { label: 'Chocolate', value: 'choco' },
                                        { label: 'Strawberry', value: 'strawberry' },
                                        { label: 'Vanilla', value: 'vanilla' },
                                    ]}
                                    placeholder={"Select border"}
                                    onChangeValue={setBorder}
                                />
                            </View>
                            <View className='px-8'>
                                <FormLabel text={"Border Color"} />
                                <Dropdown
                                    items={[
                                        { label: 'Chocolate', value: 'choco' },
                                        { label: 'Strawberry', value: 'strawberry' },
                                        { label: 'Vanilla', value: 'vanilla' },
                                    ]}
                                    placeholder={"Select border color"}
                                    onChangeValue={setBorderColor}
                                />
                            </View>
                        </View>
                    </>
                }
                {page === 5 &&
                    <>
                        <View>
                            <View className='p-8'>
                                <FormLabel text={"Toppings"} />
                                <Dropdown
                                    items={[
                                        { label: 'Whipped Cream', value: 'whipped_cream' },
                                        { label: 'Fresh Fruits', value: 'fresh_fruits' },
                                        { label: 'Chocolate Ganache', value: 'chocolate_ganache' },
                                        { label: 'Buttercream Frosting', value: 'buttercream_frosting' },
                                        { label: 'Sprinkles', value: 'sprinkles' },
                                    ]}
                                    placeholder={"Select toppings"}
                                    onChangeValue={setToppings}
                                />
                            </View>
                            <View className='p-8'>
                                <FormLabel text={"Add-on"} />
                                <Dropdown
                                    items={[
                                        { label: 'Nuts', value: 'nuts' },
                                        { label: 'Chocolate Chips', value: 'chocolate_chips' },
                                        { label: 'Caramel Drizzle', value: 'caramel_drizzle' },
                                    ]}
                                    placeholder={"Select add-on"}
                                    onChangeValue={setAddOn}
                                />
                            </View>
                        </View>
                    </>
                }
                {page === 6 &&
                    <>
                        <View>
                            <View className='p-8'>
                                <FormLabel text={"Message Type"} />
                                <Dropdown
                                    items={[
                                        { label: 'On Cake (Icing Writing)', value: 'on_cake' },
                                        { label: 'On Card (Message Card)', value: 'on_card' },
                                        { label: 'No Message', value: 'none' },
                                    ]}
                                    placeholder={"Select message type"}
                                    onChangeValue={setMessageType}
                                />
                            </View>
                            <View className='p-8'>
                                <FormLabel text={"Message"} />
                                <TextInput multiline numberOfLines={4} className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white' value={message} onChangeText={(text) => setMessage(text)} placeholder='What should the message say?' />
                            </View>
                        </View>
                    </>
                }
                {page === 7 &&
                    <>
                        <View className='px-8 '>
                            <View className='mt-4'>
                                <FormLabel text={"Add cupcakes?"} />
                                <View className='flex-row gap-2 items-center'>
                                    <Checkbox value={hasCupcakes} onChange={toggleHasCupcakes} />
                                    <Text className='text-primary font-semibold'>Yes</Text>
                                    <Checkbox value={!hasCupcakes} onChange={toggleHasCupcakes} />
                                    <Text className='text-primary font-semibold'>No</Text>
                                </View>
                            </View>
                            <View pointerEvents={hasCupcakes ? "auto" : "none"}
                                style={{ opacity: hasCupcakes ? 1 : 0.5 }} className='mt-2'>
                                <View className='p-6 border border-secondary-light rounded-md gap-2'>
                                    <View>
                                        <FormLabel text={"How many cupcakes?"} />
                                        <TextInput className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white' value={cupcakesCount} onChangeText={(text) => setCupcakesCount(text)} placeholder='e.g., 12' />

                                    </View>
                                    <View>
                                        <FormLabel text={"Add-on"} />
                                        <Dropdown
                                            items={[
                                                { label: 'Nuts', value: 'nuts' },
                                                { label: 'Chocolate Chips', value: 'chocolate_chips' },
                                                { label: 'Caramel Drizzle', value: 'caramel_drizzle' },
                                            ]}
                                            placeholder={"Select add-on"}
                                            onChangeValue={setAddOn}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                }
                {page === 8 &&
                    <>
                        <View>
                            <View className='p-8'>
                                <FormLabel text={"Comments"} />
                                <TextInput className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white' value={comments} onChangeText={(text) => setComments(text)} placeholder='Do you have specific additions or changes?' />
                            </View>
                            <View className='px-8 mt-4'>
                                <FormLabel text={"Due Date"} />
                                <DatePicker onSelectDate={setDueDate} />
                            </View>
                        </View>
                    </>
                }
                {page === 9 &&
                    <>
                        <View className='px-12 mt-4'>
                            <View className=''>
                                <FormLabel text={"Reference Image (optional)"} />
                                <Text className='text-secondary-light font-medium'>
                                    Upload a photo if you want to give reference or recreate a specific design
                                </Text>

                                <TouchableOpacity onPress={pickImage} className='bg-white h-[20vh] w-full rounded-md mt-2 border-secondary-light border justify-center items-center'>
                                    {image ?
                                        <Image
                                            source={{ uri: image }}
                                            style={{
                                                height: 150,
                                                width: 300,
                                            }}
                                            resizeMode="contain"
                                        />
                                        :
                                        <>
                                            <Upload style={{ color: '#A67C52' }} size={38} />
                                            <Text className="text-secondary-strong font-bold">Click to upload Image</Text>
                                            <Text className="text-secondary-light font-medium">PNG, JPG up to 10MB</Text>
                                        </>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                }
                {page === 10 &&
                    <>
                        <View className='px-8 gap-0.5'>
                            <View>
                                <FormLabel text={"Full Name"} />
                                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={fullName} onChangeText={(text) => setFullName(text)} placeholder='Juan Dela Cruz' />
                            </View>
                            <View>
                                <FormLabel text={"Address"} />
                                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={address} onChangeText={(text) => setAddress(text)} placeholder='123 Main St. City, Province' />
                            </View>
                            <View>
                                <FormLabel text={"Email"} />
                                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={email} onChangeText={(text) => setEmail(text)} placeholder='juan@gmail.com' />
                            </View>
                            <View>
                                <FormLabel text={"Phone Number"} />
                                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={contactNumber} onChangeText={(text) => setContactNumber(text)} placeholder='+63 912 345 6789' />
                            </View>
                            <View className='flex-row mt-2 gap-4 px-4 py-4 rounded-lg border border-secondary-light items-center'>
                                <Checkbox value={personallyDesign} onChange={setPersonallyDesign} />
                                <Text className='font-medium text-secondary-strong'>I agree to the terms and conditions, including the down payment required</Text>
                            </View>
                        </View>
                    </>
                }


                {/* Nax Prev */}
                <View className='flex-row justify-between items-center mt-auto mb-12 px-6'>
                    <TouchableOpacity onPress={() => handleChangePage('prev')} className='bg-white border-secondary-light/50 border m-6 p-4 rounded-full items-center'>
                        <ArrowLeft style={{ color: '#9A8978', backgroundColor: 'white' }} />
                    </TouchableOpacity>
                    <Text className='text-secondary-light'>{page}/{maxPage}</Text>
                    {page === maxPage ?
                        <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light m-6 p-4 rounded-2xl items-center flex-row gap-2'>
                            <Check style={{ color: 'white' }} />
                            <Text className='text-white'>Submit</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light m-6 p-4 rounded-full items-center'>
                            <ArrowRight style={{ color: 'white' }} />
                        </TouchableOpacity>

                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CustomOrders