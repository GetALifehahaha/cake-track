import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

const TermsAndConditions = () => {
    const toc = [
        {
            label: "About CakeTrack and Michelle's Cakes and Cafe",
            content: `CakeTrack is owned and operated exclusively by Michelle's Cakes and Cafe. This application is not a marketplace and does not connect customers to third-party bakers. All orders placed through CakeTrack are received, prepared, and fulfilled entirely by Michelle's Cakes and Cafe. We are fully responsible for the products and services offered through this application.`
        },
        {
            label: 'Eligibility',
            content: `You must be at least 18 years of age to create an account and place orders through CakeTrack. By using the App, you confirm that you meet this age requirement and that all information you provide is accurate, current, and complete. We reserve the right to suspend or close accounts that do not meet these requirements.`
        },
        {
            label: 'Account Registration and Security',
            content: `Creating an account allows you to browse available items, place orders and track your order history. By registering, you agree to:
- Provide accurate and up-to-date personal information.
- Keep your login credentials confidential and not share them with others.
- Notify us immediately if you suspect any unauthorized access to your account.
- Accept responsibility for all activity that occurs under your account.

Michelle's Cakes and Cafe shall not be liable for any loss arising from your failure to safeguard your account credentials.`
        },
        {
            label: 'Placing Orders',
            content: `4.1 Standard Orders
You may browse our available cake offerings and place a standard order directly through CakeTrack. By completing a standard order, you agree to the item, quantity, pricing, and collection terms shown at the time of checkout.

4.2 Custom Cake Orders
CakeTrack allows you to submit a Custom Order specifying your preferred cake design, flavor, size, tier configuration, color scheme, decorations, and any other personalized details. When placing a Custom Order, you agree to:
- Provide complete and accurate design specifications and instructions.
- Upload only original or legally licensed reference images.
- Review and confirm all order details before final submission.
- Understand that while we will make every effort to fulfill your design vision, exact replication of complex or highly detailed designs cannot be guaranteed.
- Submit the required downpayment to secure and confirm your order.

Custom Orders are subject to our review and confirmation. We reserve the right to decline or request modification of any Custom Order that cannot be reasonably fulfilled with available ingredients, timeframes, or our production capabilities. You will be notified promptly in such cases via text or a phone call from the organization.`
        },
        {
            label: 'Pricing and Payment',
            content: `All prices displayed on CakeTrack are set by Michelle's Cakes and Cafe and are inclusive of applicable fees unless otherwise stated. By completing a purchase, you authorize us to charge the total amount shown at checkout to your selected payment method alongside the downpayment.

We use secure third-party payment processors to handle all transactions. We do not store your full payment card details. All payments are subject to the terms of the applicable payment processor.

For Custom Orders, a deposit or full prepayment may be required at the time of order confirmation. Any deposit requirements will be clearly communicated before you finalize your order. Deposits are non-refundable once we have commenced preparation, except as described in Section 6.`
        },
        {
            label: 'Cancellations, Modifications, and Refunds',
            content: `We understand that plans can change. Our policy is as follows:
- Standard Orders may be cancelled for a full refund if requested before the scheduled collection, provided preparation has not yet begun and will depend on the organization's discretion. Standard orders are not allowed to be modified.
- Custom Orders may be cancelled or modified within 48 hours of order confirmation, provided we have not yet sourced materials or commenced preparation. Cancellations made after this window may result in partial or no refund, depending on the stage of preparation.
- Cancellation requests are not automatically approved. If you wish to cancel an order for which a downpayment has been made, you must submit a formal cancellation request through the App. Your request will be reviewed and responded to by Michelle's Cakes and Cafe, as your order may already be in preparation or fully baked by the time of your request. Cancellation approval is at our discretion based on the current stage of your order.
- If your cancellation request is approved before preparation has begun, your downpayment will be refunded in full. If preparation is already underway at the time of approval, your downpayment may be partially or fully non-refundable to cover costs already incurred.
- If you are unsatisfied with your order due to a significant error on our part (for example, incorrect flavor, size, or design substantially different from what was agreed), please contact us within 24 hours of receiving your order with photographs. We will assess the concern and offer a suitable resolution, which may include a partial refund, store credit, or remake at our discretion.
- Refunds will be processed to the original payment method within 5-7 business days.`
        },
        {
            label: 'Collection',
            content: `Michelle's Cakes and Cafe offers in-store collection options, as specified at the time of ordering. However, other forms of collection may be allowed as long as the organization has been contacted with the new form of collection. Please note the following:
- For other forms of collection such as delivery, you are responsible for providing a complete and accurate delivery address. We are not responsible for failed deliveries due to incorrect address information or your unavailability at the time of delivery.
- For collection orders, your cake will be held for you at our cafe during the agreed collection window. Uncollected orders held beyond the agreed window may be subject to storage limitations.
- Risk of damage to your cake transfers to you upon delivery or collection. Any concerns about damage or errors must be reported to us within 2 hours of receipt, with supporting photographs.`
        },
        {
            label: 'Allergens and Dietary Information',
            content: `Our cakes may contain or have been prepared in an environment with common allergens including but not limited to gluten, dairy, eggs, nuts, and soy. Allergen and ingredient information is provided in good faith based on our standard recipes. However, we cannot guarantee the complete absence of any allergen due to shared preparation environments.

It is your responsibility to review all allergen information before placing an order and to notify us at the time of ordering of any specific dietary requirements or allergies. For Custom Orders, please clearly state any allergen restrictions in your order specifications. Michelle's Cakes and Cafe shall not be liable for any adverse reactions where allergen information was provided but disregarded, or where the customer failed to disclose known allergies.`
        },
        {
            label: 'Acceptable Use',
            content: `By using CakeTrack, you agree not to:
- Provide false, misleading, or fraudulent order information.
- Use the App for any unlawful purpose or in violation of any applicable law or regulation.
- Attempt to access, tamper with, or disrupt any part of the App or its underlying systems.
- Upload or submit content that is offensive, defamatory, or that infringes on the intellectual property rights of any third party.
- Use automated tools, bots, or scripts to interact with the App.

We reserve the right to suspend or permanently close accounts that engage in any of the above conduct.`
        },
        {
            label: 'Intellectual Property',
            content: `10.1 CakeTrack Software - Owned by EFIXXO
The CakeTrack software platform, including the mobile application, web application, source code, system architecture, user interface design, and all underlying technology, is the exclusive intellectual property of EFIXXO, the software development team that created and built CakeTrack. All rights, title, and interest in and to the CakeTrack software are retained by EFIXXO and are protected under applicable intellectual property and software laws.

Michelle's Cakes and Cafe is the licensed client of EFIXXO and operates CakeTrack under an authorized business license. The use of the CakeTrack platform by Michelle's Cakes and Cafe does not constitute a transfer of ownership of the software or any of its components to Michelle's Cakes and Cafe or to any end user. No part of the CakeTrack software, including its code, design, or system components, may be copied, modified, redistributed, reverse-engineered, or reproduced in any form without the express written permission of EFIXXO.

10.2 Business Content - Owned by Michelle's Cakes and Cafe
All business content published through CakeTrack, including but not limited to the Michelle's Cakes and Cafe name and branding, product listings, cake photographs, menu descriptions, and pricing, is the property of Michelle's Cakes and Cafe. You may not reproduce, redistribute, or use any of this content without the prior written permission of Michelle's Cakes and Cafe.

10.3 User-Submitted Content
By submitting custom design references, images, or instructions through CakeTrack, you confirm that you have the right to share such content and grant Michelle's Cakes and Cafe a limited, non-exclusive license to use it solely for the purpose of fulfilling your order. You retain ownership of any original content you submit.`
        },
        {
            label: 'Privacy',
            content: `Your use of CakeTrack is subject to our Privacy Policy, which is incorporated into these Terms by reference. Our Privacy Policy explains what personal information we collect, how we use it, and how we protect it. By using CakeTrack, you consent to our data practices as described in the Privacy Policy.`
        },
        {
            label: 'Limitation of Liability',
            content: `To the fullest extent permitted by applicable law, Michelle's Cakes and Cafe's liability to you for any claim arising out of your use of CakeTrack or any order placed through the App shall not exceed the total amount you paid for the specific order giving rise to the claim.

We are not liable for any indirect, incidental, or consequential losses, including loss of enjoyment or inconvenience arising from order delays or changes, provided we have acted reasonably and in good faith.`
        },
        {
            label: 'Changes to These Terms',
            content: `We may update these Terms from time to time to reflect changes in our services, legal requirements, or business practices. When we make material changes, we will notify you via the App if any changes do occur. Your continued use of CakeTrack after such notification constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms, you should stop using the App and may close your account.`
        },
        {
            label: 'Account Termination',
            content: `You may close and/or delete your CakeTrack account at any time through the App settings. We may suspend or terminate your account if you breach these Terms or engage in conduct that is harmful to our business or other customers. Termination does not affect any outstanding obligations, including payment for confirmed orders.`
        },
        {
            label: 'Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where Michelle's Cakes and Cafe operates. Any disputes that cannot be resolved amicably between the parties shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.`
        },
        {
            label: 'Contact Us',
            content: `If you have any questions about these Terms, your order, or our services, please do not hesitate to reach out to us:`
        },
    ];

    const [expandedSections, setExpandedSections] = useState([]);

    const handleExpanded = (index) => {
        setExpandedSections((prev) => {
            if (prev.includes(index)) {
                return prev.filter((item) => item !== index);
            }
            return [...prev, index];
        });
    };

    return (
        <SafeAreaView className='flex-1 bg-main-form'>
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-primary text-xl font-semibold'>Terms and Conditions</Text>
                <View className='w-6' />
            </View>

            <ScrollView className='flex-1 px-6 py-4' showsVerticalScrollIndicator={false}>
                {toc.map(({ label, content }, index) => {
                    const isExpanded = expandedSections.includes(index);

                    return (
                        <TouchableOpacity
                            key={index}
                            className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'
                            onPress={() => handleExpanded(index)}
                        >
                            <View className='flex flex-row gap-4 items-start justify-between'>
                                <Text className='text-primary font-bold text-base mb-2'>{index + 1}. {label}</Text>
                                <ChevronDown
                                    color={'#8B5A3C'}
                                    style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                                />
                            </View>
                            {isExpanded && (
                                <Text className='text-secondary-strong p-2 border-t mt-2 border-t-secondary-light'>
                                    {content}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsAndConditions;