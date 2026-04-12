import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

const PrivacyPolicy = () => {
    const privacyTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');
    const toc = [
        {
            label: "Information We Collect",
            content: `When you register for an account or place an order through CakeTrack, we collect the following personal information:
- Full Name — to identify your account and personalize your orders.
- Address — to process your cake orders to the correct location.
- Phone Number — to contact you regarding your order status, delivery updates, or any issues with your order.
- Email Address — to send order confirmations, account notifications, and service updates.

We do not collect sensitive personal information such as government-issued identification numbers, financial account details, or health information. Payment processing is handled entirely by secure third-party payment processors, and we do not store your full card or payment details on our systems.`
        },
        {
            label: "How We Use Your Information",
            content: `The personal information we collect is used strictly for the following purposes:
- Account Management — to create, maintain, and secure your CakeTrack account.
- Order Processing — to receive, confirm, prepare, and fulfill your cake orders, including custom orders.
- Customer Communication — to notify you of order updates, estimated delivery times, delays, or any issues requiring your attention.
- Customer Support — to respond to your inquiries, complaints, or requests for assistance.
- Service Improvement — to understand how customers use CakeTrack and improve our ordering experience over time.

We do not use your personal information for automated decision-making or profiling that produces legal or similarly significant effects on you.`
        },
        {
            label: "Legal Basis for Processing",
            content: `We process your personal information on the following legal grounds:
- Contractual Necessity — processing is required to fulfill your orders and deliver our services to you.
- Legitimate Interests — we have a legitimate interest in operating and improving our business, communicating with customers, and maintaining the security of our platform.
- Consent — where you have provided explicit consent, such as opting in to receive promotional communications.`
        },
        {
            label: "Sharing of Your Information",
            content: `We respect your privacy and do not sell, rent, or trade your personal information to third parties. We may share your information only in the following limited circumstances:
- Service Providers — we may share necessary information with third-party service providers who assist us in operating CakeTrack, such as payment processors and delivery partners, solely for the purpose of fulfilling your order. These providers are bound by confidentiality obligations.
- EFIXXO (Software Provider) — as the developer and maintainer of the CakeTrack platform, EFIXXO may have access to technical system data for the purpose of platform maintenance, security monitoring, and software support. EFIXXO does not use your personal data for any commercial or marketing purposes.
- Legal Compliance — we may disclose your information if required to do so by law, court order, or government authority, or to protect the rights, property, or safety of Michelle's Cakes and Cafe, our customers, or the public.

We will never share your personal information with advertisers or unrelated third parties.`
        },
        {
            label: "Data Retention",
            content: `We retain your personal information for as long as your account is active or as needed to provide you with our services. Specifically:
- Active Account — your personal data is retained for the full duration of your account's active status.
- Deactivated Account — if you deactivate your account, your data is retained for 30 days to allow for reactivation. If the account is not reactivated within this period, your personal data will be permanently deleted.
- Order Records — transaction and order records may be retained for a longer period as required for financial, legal, or dispute resolution purposes, even after account deletion.`
        },
        {
            label: "Data Security",
            content: `We take the security of your personal information seriously. Michelle's Cakes and Cafe and EFIXXO implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, alteration, or disclosure. These measures include secure data transmission protocols, access controls, and regular security reviews of the CakeTrack platform.

While we strive to protect your personal information, no method of electronic transmission or storage is 100% secure. In the event of a data breach that is likely to affect your rights and freedoms, we will notify you promptly in accordance with applicable law.`
        },
        {
            label: "Your Rights",
            content: `You have the following rights regarding your personal information held by Michelle's Cakes and Cafe:
- Right to Access — you may request a copy of the personal information we hold about you.
- Right to Correction — you may update or correct inaccurate personal information by contacting us.
- Right to Deletion — you may request the deletion of your personal data. Requests will be processed in accordance with our data retention policy and applicable law.
- Right to Withdraw Consent — where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.
- Right to Object — you may object to the processing of your personal data for direct marketing purposes at any time.

To exercise any of the above rights, please contact us using the details provided in Section 11.`
        },
        {
            label: "Cookies and App Analytics",
            content: `CakeTrack may use cookies or similar tracking technologies to improve the functionality and user experience of the application. These may include session cookies necessary for the App to function, and analytics data used to understand how users interact with the platform. No personally identifiable information is shared with analytics providers beyond what is necessary for service improvement.

You may adjust your device settings to limit data collection by the App. However, disabling certain technologies may affect the functionality of CakeTrack.`
        },
        {
            label: "Children's Privacy",
            content: `CakeTrack is intended for use by individuals aged 18 and above, as outlined in our Terms and Conditions. We do not knowingly collect personal information from anyone under the age of 18. If we become aware that a minor has provided us with personal data, we will take immediate steps to delete such information from our systems.`
        },
        {
            label: "Changes to This Privacy Policy",
            content: `We may update this Privacy Policy from time to time to reflect changes in our practices, legal obligations, or the features of CakeTrack. When material changes are made, we will notify you via the App or by email. Your continued use of CakeTrack after such notification constitutes your acceptance of the updated Privacy Policy. We encourage you to review this Policy periodically.`
        },
        {
            label: "Contact Us",
            content: `If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact us at:

Michelle's Cakes and Cafe
App: CakeTrack
Phone: 0966 443 1581
Address: Boalan, Zamboanga City`
        }
    ];

    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleExpanded = (index) => {
        setExpandedIndex((previous) => (previous === index ? null : index));
    };

    return (
        <ImageBackground source={privacyTexture} style={{ flex: 1 }} resizeMode='repeat'>
            <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light bg-white/90'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft style={{ color: '#8B5A3C' }} />
                    </TouchableOpacity>
                    <Text className='text-primary text-xl font-semibold'>Privacy Policy</Text>
                    <View className='w-6' />
                </View>

                <ScrollView className='flex-1 px-5 pt-4' showsVerticalScrollIndicator={false}>
                    <View className='mb-4 rounded-2xl bg-[#FFF7EA] border border-[#E6BE86] p-4'>
                        <Text className='text-primary text-lg font-extrabold'>Privacy Policy</Text>
                        <Text className='text-secondary-strong text-sm mt-1'>See how personal data is collected and protected.</Text>
                    </View>

                    {toc.map(({ label, content }, index) => {
                        const isExpanded = expandedIndex === index;

                        return (
                            <TouchableOpacity
                                key={label}
                                className='mb-3 rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4'
                                activeOpacity={0.9}
                                onPress={() => handleExpanded(index)}
                            >
                                <View className='flex-row gap-3 items-start justify-between'>
                                    <Text className='text-primary font-bold text-base flex-1'>{index + 1}. {label}</Text>
                                    <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                                        <ChevronDown color='#8B5A3C' size={20} />
                                    </View>
                                </View>
                                {isExpanded && (
                                    <Text className='text-secondary-strong leading-6 border-t border-[#EEE4D8] mt-3 pt-3'>
                                        {content}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    <View className='h-4' />
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default PrivacyPolicy;