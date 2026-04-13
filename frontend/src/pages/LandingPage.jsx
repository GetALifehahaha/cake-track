import React from 'react'
import {
	ArrowRight,
	BadgeCheck,
	Cake,
	CakeSlice,
	ClipboardList,
	Clock3,
	Download,
	Smartphone,
	Store,
	Truck,
} from 'lucide-react'
import logoImage from '../assets/image/team_logo.png'
import showcaseOne from '../assets/image/landing_page_image/image_1.jpg'
import showcaseTwo from '../assets/image/landing_page_image/image_2.png'
import showcaseThree from '../assets/image/landing_page_image/image_3.png'

const highlights = [
	{
		title: 'Build Your Perfect Cake',
		description: 'Choose flavors, layers, fillings, and design notes in one guided flow.',
		icon: ClipboardList,
	},
	{
		title: 'Live Order Updates',
		description: 'Know where your order is from confirmation to final pickup or delivery.',
		icon: Clock3,
	},
	{
		title: 'Ready for Celebrations',
		description: 'From birthdays to weddings, every order is tracked with clear details.',
		icon: CakeSlice,
	},
]

const processSteps = [
	{
		step: '01',
		title: 'Choose & Customize',
		description: 'Pick a base cake and personalize it with your preferred style and message.',
		icon: Cake,
	},
	{
		step: '02',
		title: 'Confirm Details',
		description: 'Review pricing, schedule, and notes before placing your final order.',
		icon: BadgeCheck,
	},
	{
		step: '03',
		title: 'Track Progress',
		description: 'Follow status updates so you always know what is happening in real time.',
		icon: Smartphone,
	},
	{
		step: '04',
		title: 'Receive & Celebrate',
		description: 'Get your custom cake on schedule and enjoy your moment with confidence.',
		icon: Truck,
	},
]

const teamMembers = [
	{ role: 'Project Manager', name: 'Mathew Angeles' },
	{ role: 'Business Analyst', name: 'Charles Leslie Morgan' },
	{ role: 'Lead Developer', name: 'Ahlan-nour Sencio' },
	{ role: 'UI/UX Designer', name: 'Adrian Agraviador' },
	{ role: 'Quality Assurance', name: 'Alsamhel Jawadil' },
]

const cakeShowcase = [
	{ name: 'Chocolate Moist', image: showcaseOne, label: '' },
	{ name: 'French Vanilla Cake', image: showcaseTwo, label: '' },
	{ name: 'Mango Bravo', image: showcaseThree, label: '' },
]

const app_url = "https://expo.dev/artifacts/eas/vEp9Y3VHV1ZkeFHg8Jkb57.apk"

const LandingPage = () => {
	return (
		<div className='bg-accent-mute/20 w-full min-h-screen p-2'>
			{/* Header */}
			<div className='rounded-xl bg-white h-full w-full shadow-sm overflow-hidden flex flex-col'>
				<div className="relative bg-linear-140 from-[#190d06] via-[#421010] to-[#5b2006] h-[110vh] xl:h-[90vh]">
					<div className='h-20 w-4/5 mx-auto flex items-center justify-between'>
						<span className='flex items-center font-bold text-2xl tracking-tight'>
							<h1 className='text-white'>Cake</h1>
							<h1 className='text-accent-mute'>Track</h1>
						</span>
						<button
							onClick={() => location.href = app_url}
							className='group relative overflow-hidden py-2.5 px-8 rounded-2xl border-2 border-border text-border font-semibold cursor-pointer hover:text-accent-dark
							before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-white/90 before:transition-all before:duration-300 hover:before:w-full'
						>
							<span className="relative z-10 flex items-center gap-8">
								<Download size={18} />
								<h5 className='hidden md:block'>Download CakeTrack</h5>
							</span>
						</button>
					</div>

					<Cake size={240} className='text-white/20 blur-md -skew-12 absolute bottom-9 right-20' />
					<Cake size={240} className='text-white/5 blur skew-y-12 absolute top-20 left-10' />

					<div className='w-4/5 mx-auto mt-20 flex'>
						<div className='flex-1'>
							<h1 className='text-accent-mute text-xl font-semibold capitalize text-center md:text-left'>Welcome to CakeTrack</h1>
							<div className='my-6 flex flex-col gap-2 font-extrabold text-6xl text-white tracking-tight text-center md:text-left'>
								<h2 className='text-shadow-accent/20 text-shadow-lg'>Designed by You,</h2>
								<h2 className='text-shadow-accent/20 text-shadow-lg'>Baked by Us</h2>
							</div>
							<p className='text-justify p-4.5 my-2 border-2 border-border/20 rounded-2xl text-border font-semibold text-md'>CakeTrack turns your cake vision into a clear, trackable order your baker can execute with precision.
								Because great celebrations begin with confidence in every detail.</p>

							<div className='flex gap-2 mt-4 w-5/6 mx-auto'>
								<button onClick={() => location.href = app_url} className='flex-1 rounded-sm bg-accent-mute text-black font-semibold py-4.5 cursor-pointer flex flex-col shadow-accent/40 shadow-2xl hover:text-white hover:animate-pulse hover:-translate-y-0.5 hover:transition-all items-center justify-center'>
									<h5 className='text-xs text-center text-text/50'>
										Download via
									</h5>
									<h2 className='text-3xl font-extrabold tracking-tight'>EXPO</h2>
								</button>
								<button className='flex-1 rounded-sm bg-accent-mute text-black font-semibold py-2.5 flex flex-col shadow-accent/40 shadow-2xl  items-center justify-center opacity-20 cursor-not-allowed' disabled>
									<h5 className='text-xs text-center text-text/50'>
										Visit us On
									</h5>
									<h2 className='text-3xl font-extrabold tracking-tight'>PLAY STORE</h2>
								</button>
							</div>
							<h4 className='text-center text-sm text-accent-mute/50 mt-4'>Experience Greatness Now!</h4>
							<div className='flex items-center gap-4 font-semibold text-xs text-white/50 tracking-wide justify-evenly mt-8 animate-pulse'>
								<h5>Expo</h5>
								<h5>Tailwind</h5>
								<h5>React Native</h5>
							</div>
						</div>

						<div className='flex-1 hidden lg:block'></div>
					</div>

					<div className='absolute bottom-0 left-0 w-full overflow-hidden leading-none'>
						<svg viewBox='0 0 1440 320' className='h-[95px] w-full' preserveAspectRatio='none'>
							<path
								fill='#ffffff'
								d='M0,128L24,117.3C48,107,96,85,144,74.7C192,64,240,64,288,58.7C336,53,384,43,432,48C480,53,528,75,576,90.7C624,107,672,117,720,106.7C768,96,816,64,864,64C912,64,960,96,1008,133.3C1056,171,1104,213,1152,208C1200,203,1248,149,1296,133.3C1344,117,1392,139,1416,149.3L1440,160L1440,320L0,320Z'
							/>
						</svg>
					</div>
				</div>

				<section className='mx-auto w-4/5 px-5 pb-6 pt-10 sm:px-8 md:pt-14'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<p className='text-xs font-bold uppercase tracking-[0.2em] text-accent-text'>What Makes It Better</p>
							<h3 className='mt-2 text-2xl font-extrabold text-[#26150d] sm:text-3xl'>Built for Smooth Cake Ordering</h3>
						</div>
						<p className='max-w-xl text-sm text-text-light sm:text-base'>
							CakeTrack is designed for customers and bakers who need clear communication, less back and forth,
							and fast order confidence.
						</p>
					</div>

					<div className='mt-6 grid gap-4 md:grid-cols-3'>
						{highlights.map((highlight) => {
							const IconComponent = highlight.icon

							return <article
								key={highlight.title}
								className='rounded-2xl border border-border/70 bg-[#fffdf9] p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10'
							>
								<div className='inline-flex rounded-xl bg-accent-mute/20 p-2.5 text-accent-dark'>
									<IconComponent size={20} />
								</div>
								<h4 className='mt-4 text-lg font-bold text-[#26150d]'>{highlight.title}</h4>
								<p className='mt-2 text-sm leading-relaxed text-text-light'>{highlight.description}</p>
							</article>
						})}
					</div>
				</section>

				<section className='mx-auto w-4/5 px-5 py-6 sm:px-8'>
					<div className='rounded-3xl border border-border/70 bg-[#fff8f2] p-5 sm:p-7'>
						<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
							<h3 className='text-2xl font-extrabold text-[#26150d]'>Featured Cake Inspirations</h3>
						</div>

						<div className='mt-5 grid gap-4 md:grid-cols-3'>
							{cakeShowcase.map((cake) => (
								<article key={cake.name} className='group overflow-hidden rounded-2xl border border-accent-mute/40 bg-white'>
									<div className='relative h-52 overflow-hidden'>
										<img
											src={cake.image}
											alt={cake.name}
											className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
										/>
										<span className='absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3d2418]'>
											{cake.label}
										</span>
									</div>
									<div className='p-4'>
										<h4 className='text-lg font-bold text-[#26150d]'>{cake.name}</h4>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className='mx-auto w-4/5 px-5 py-8 sm:px-8'>
					<div className='flex flex-col gap-2'>
						<p className='text-xs font-bold uppercase tracking-[0.2em] text-accent-text'>Flow</p>
						<h3 className='text-2xl font-extrabold text-[#26150d] sm:text-3xl'>How CakeTrack Works</h3>
					</div>

					<div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{processSteps.map((processStep) => {
							const IconComponent = processStep.icon

							return <article
								key={processStep.step}
								className='rounded-2xl border border-border/80 bg-white p-5 transition hover:border-accent-mute hover:shadow-lg hover:shadow-accent/10'
							>
								<div className='flex items-center justify-between'>
									<span className='text-sm font-extrabold tracking-[0.16em] text-accent-text'>{processStep.step}</span>
									<IconComponent size={18} className='text-accent-dark' />
								</div>
								<h4 className='mt-4 text-lg font-bold text-[#26150d]'>{processStep.title}</h4>
								<p className='mt-2 text-sm leading-relaxed text-text-light'>{processStep.description}</p>
							</article>
						})}
					</div>
				</section>

				<section className='mx-auto w-4/5 px-5 py-8 sm:px-8'>
					<div className='grid gap-6 rounded-3xl border border-border/70 bg-linear-to-r from-white to-[#f8f2eb] p-6 lg:grid-cols-2 lg:p-8'>
						<div className='space-y-4'>
							<p className='text-xs font-bold uppercase tracking-[0.2em] text-accent-text'>Mobile Experience</p>
							<h3 className='text-2xl font-extrabold text-[#26150d] sm:text-3xl'>Clean Screens, Fast Decisions</h3>
							<p className='text-sm leading-relaxed text-text-light sm:text-base'>
								The app keeps your most important order information upfront: order summary, custom requests,
								statuses, and payment flow. Whether you are ordering from home or in transit, the experience stays smooth.
							</p>

							<ul className='space-y-2 text-sm font-semibold text-[#3d2418]'>
								<li className='flex items-center gap-2'><BadgeCheck size={16} className='text-accent-text' /> Smart custom order form</li>
								<li className='flex items-center gap-2'><BadgeCheck size={16} className='text-accent-text' /> Real-time status updates</li>
								<li className='flex items-center gap-2'><BadgeCheck size={16} className='text-accent-text' /> Fast checkout and payment handoff</li>
							</ul>
						</div>

						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='overflow-hidden rounded-2xl border border-border/70 bg-white p-3'>
								<img src={showcaseOne} alt='CakeTrack screen preview one' className='h-56 w-full rounded-xl object-cover' />
							</div>
							<div className='overflow-hidden rounded-2xl border border-border/70 bg-white p-3'>
								<img src={showcaseTwo} alt='CakeTrack screen preview two' className='h-56 w-full rounded-xl object-cover' />
							</div>
						</div>
					</div>
				</section>

				<section className='mx-auto w-full px-5 pb-8 pt-2 sm:px-8'>
					<div className='rounded-3xl bg-linear-to-r from-[#2a160e] via-[#4e2411] to-[#7b3615] p-6 text-white sm:p-8'>
						<div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
							<div>
								<p className='text-xs font-bold uppercase tracking-[0.2em] text-[#f8d0aa]'>Final Thought</p>
								<h3 className='mt-2 text-2xl font-black tracking-tight sm:text-3xl'>Your Best Celebration Starts Here</h3>
								<p className='mt-3 max-w-xl text-sm text-[#ffe7d1] sm:text-base'>
									Stop guessing order progress and start celebrating with confidence. CakeTrack gives you clarity,
									control, and a better cake-ordering journey from start to finish.
								</p>
							</div>
							<button onClick={() => location.href = app_url} className='inline-flex items-center justify-center gap-2 self-start rounded-xl bg-accent-mute px-5 py-3 text-sm font-extrabold text-[#22120b] transition hover:-translate-y-0.5 hover:bg-[#ceb29f] cursor-pointer'>
								Download CakeTrack
								<ArrowRight size={16} />
							</button>
						</div>
					</div>
				</section>

				<footer className='border-t border-border/70 bg-[#fcfaf8]'>
					<div className='mx-auto grid w-full gap-6 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:gap-10'>
						<div>
							<h4 className='border-l-2 border-accent pl-4 text-sm font-black tracking-[0.14em] text-[#26150d]'>ABOUT EFIXXO</h4>
							<p className='mt-4 text-sm leading-relaxed text-text-light'>
								The team <strong>EFIXXO</strong> is a software development company founded on August 14, 2025,
								by five IT students from the College of Computing Studies at Western Mindanao State University.
								Built on innovation and teamwork, EFIXXO focuses on efficient and user-friendly digital tools.
							</p>

							<h5 className='mt-6 border-l-2 border-accent pl-4 text-sm font-black tracking-[0.14em] text-[#26150d]'>THE TEAM</h5>
							<div className='mt-4 grid gap-3 sm:grid-cols-2'>
								{teamMembers.map((member) => (
									<div key={member.name} className='rounded-xl border border-border/70 bg-white px-3 py-2.5'>
										<p className='text-xs font-semibold text-accent-text'>{member.role}</p>
										<p className='mt-0.5 text-sm font-bold text-[#24140d]'>{member.name}</p>
									</div>
								))}
							</div>
						</div>

						<div className='rounded-3xl border border-border bg-white p-6 sm:p-8'>
							<img src={logoImage} alt='EFIXXO team logo' className='mx-auto h-44 w-44 rounded-2xl object-cover sm:h-56 sm:w-56' />
							<p className='mt-5 text-center text-sm font-semibold text-text-light'>
								CakeTrack by EFIXXO. Designed to make custom cake ordering clear, beautiful, and reliable.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}

export default LandingPage