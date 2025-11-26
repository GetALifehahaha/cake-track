import './global.css';
import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight } from 'lucide-react-native';
import FormLabel from '@/components/atoms/FormLabel';
import Dropdown from '@/components/atoms/Dropdown';

const CustomOrders = () => {
    const [customDisplay, setCustomDisplay] = useState();
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
    

    const handleChangePage = (direction) => {
        if (direction === 'next' && page < maxPage) {
            setPage(page + 1);
        } else if (direction === 'prev' && page > 1) {
            setPage(page - 1);
        }
    }

    
    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C] items-center justify-center'>
            <View className='h-[40vh] p-8 pt-16'>
                <View className='aspect-square h-full bg-white rounded-lg justify-center items-center'>
                    {customDisplay ? (
                        <Text className='font-bold text-3xl text-center'>Custom Order: {customDisplay}</Text>
                    ) : (
                        <Text className='text-sm font-semibold text-gray-300'>CAKE PREVIEW</Text>
                    )}
                </View>
            </View>

            <View className='bg-white w-full flex-1 rounded-t-[3rem]'>
                {/* Header */}
                

                {/* Occasion */}
                { page === 1 &&
                    <>
                        <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                            <View>
                                <Text className='text-2xl font-semibold text-[#8B5A3C]'>Cake Details</Text>
                                <Text className='text-[#9A8978]'>Customize you perfect cake</Text>
                            </View>

                            <TouchableOpacity onPress={() => router.back()}><X /></TouchableOpacity>
                        </View>
                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Occassion"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Birthday', value: 'birthday'},
                                        {label: 'Anniversary', value: 'anniversary'},
                                        {label: 'Wedding', value: 'wedding'},
                                        {label: 'Graduation', value: 'graduation'},
                                        {label: 'Other', value: 'other'},
                                    ]}
                                    placeholder={"Select an occasion"}
                                    onChangeValue={setOccasion}
                                />
                                {occasion == 'other' && <TextInput className='py-5 px-2 rounded-md border border-secondary-light mt-4' value={specifyOccasion} onChangeText={(text) => setSpecifyOccasion(text)} placeholder='Specify your occassion'/>

                                }
                            </View>

                            <View>
                                {/* Checkbox */}
                                <View>
                                    <TouchableOpacity className='flex-row gap-2'>
                                        <Text>Allow the baker to personally design your cake</Text>
                                    </TouchableOpacity>

                                </View>

                                {/* Disclaimer */}
                                <View>

                                </View>
                            </View>
                        </View>
                    </>
                }
                { page === 2 &&
                    <>
                        <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                            <View>
                                <Text className='text-2xl font-semibold text-[#8B5A3C]'>Cake Details</Text>
                                <Text className='text-[#9A8978]'>Customize you perfect cake</Text>
                            </View>

                            <TouchableOpacity onPress={() => router.back()}><X /></TouchableOpacity>
                        </View>
                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Shape"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Square', value: 'square'},
                                        {label: 'Round', value: 'round'},
                                        {label: 'Rectangle', value: 'rectangle'},
                                        {label: 'Other', value: 'other'},
                                    ]}
                                    placeholder={"Select shape"}
                                    onChangeValue={setShape}
                                />
                                {shape == 'other' && <TextInput className='py-5 px-2 rounded-md border border-secondary-light mt-4' value={specifyShape} onChangeText={(text) => setSpecifyShape(text)} placeholder='Specify your shape'/>

                                }
                            </View>

                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Cake Tier"}/>
                                <Dropdown 
                                    items={[
                                        {label: '1-Tier', value: 1},
                                        {label: '2-Tier', value: 2},
                                        {label: '3-Tier', value: 3},
                                    ]}
                                    placeholder={"Select shape"}
                                    onChangeValue={setTier}
                                />
                            </View>
                        </View>
                    </>
                }
                { page === 3 &&
                    <>
                        <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                            <View>
                                <Text className='text-2xl font-semibold text-[#8B5A3C]'>Cake Details</Text>
                                <Text className='text-[#9A8978]'>Customize you perfect cake</Text>
                            </View>

                            <TouchableOpacity onPress={() => router.back()}><X /></TouchableOpacity>
                        </View>
                        <View>
                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Base Flavor"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Chocolate', value: 'chocoloate'},
                                        {label: 'Strawberry', value: 'strawberry'},
                                        {label: 'Vanilla', value: 'vanilla'},
                                    ]}
                                    placeholder={"Select base flavor"}
                                    onChangeValue={setBaseFlavor}
                                />
                            </View>

                            {/* Dropdown */}
                            <View className='p-8'>
                                <FormLabel text={"Filling"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Chocolate', value: 'chocoloate'},
                                        {label: 'Strawberry', value: 'strawberry'},
                                        {label: 'Vanilla', value: 'vanilla'},
                                    ]}
                                    placeholder={"Select filling"}
                                    onChangeValue={setFilling}
                                />
                            </View>
                        </View>
                    </>
                }
                { page === 4 &&
                    <>
                        <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                            <View>
                                <Text className='text-2xl font-semibold text-[#8B5A3C]'>Cake Details</Text>
                                <Text className='text-[#9A8978]'>Customize you perfect cake</Text>
                            </View>

                            <TouchableOpacity onPress={() => router.back()}><X /></TouchableOpacity>
                        </View>
                        <View className='py-6 justify-evenly flex-1'>
                            <View className='px-8'>
                                <FormLabel text={"Coating Color"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Chocolate', value: 'chocoloate'},
                                        {label: 'Strawberry', value: 'strawberry'},
                                        {label: 'Vanilla', value: 'vanilla'},
                                    ]}
                                    placeholder={"Select coating color"}
                                    onChangeValue={setCoatingColor}
                                />
                            </View>
                            <View className='px-8'>
                                <FormLabel text={"Border"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Chocolate', value: 'chocoloate'},
                                        {label: 'Strawberry', value: 'strawberry'},
                                        {label: 'Vanilla', value: 'vanilla'},
                                    ]}
                                    placeholder={"Select border"}
                                    onChangeValue={setBorder}
                                />
                            </View>
                            <View className='px-8'>
                                <FormLabel text={"Border Color"}/>
                                <Dropdown 
                                    items={[
                                        {label: 'Chocolate', value: 'chocoloate'},
                                        {label: 'Strawberry', value: 'strawberry'},
                                        {label: 'Vanilla', value: 'vanilla'},
                                    ]}
                                    placeholder={"Select border color"}
                                    onChangeValue={setBorderColor}
                                />
                            </View>
                        </View>
                    </>
                }


                {/* Nax Prev */}
                <View className='flex-row justify-between items-center mt-auto mb-12 px-6'>
                    <TouchableOpacity onPress={() => handleChangePage('prev')} className='bg-white border-secondary-light/50 border m-6 p-4 rounded-full items-center'>
                        <ArrowLeft style={{color: '#9A8978', backgroundColor: 'white'}} />
                    </TouchableOpacity>
                    <Text className='text-secondary-light'>{page}/{maxPage}</Text>
                    <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light m-6 p-4 rounded-full items-center'>
                        <ArrowRight style={{color: 'white'}} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CustomOrders