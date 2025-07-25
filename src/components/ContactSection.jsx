import { Instagram, Linkedin, Mail, MapPin, Phone, Send, TwitterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const ContactSection = () => {
    return (
        <section 
            id="contact" 
            className="py-24 px-4 relative bg-secondary/30"
        >
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                    Get in <span className="text-primary">Touch</span>
                </h2>

                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Have a project in mind or want to collaborate? Feel free to reach out.
                    I'm always open to discussing new opportunities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h3 className="text-2xl font-semibold mb-6"></h3>
                        <div className="space-y-6 justify-center">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4> Email</h4>
                                    <a href="mailto:jd.franco.caballero@gmail.com" className="text-muted-foreground hover:text-primary transition-colors"> jd.franco.caballero@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4> Phone</h4>
                                    <a href="tel:+17034011926" className="text-muted-foreground hover:text-primary transition-colors"> +1 (703) 401-1926</a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4> Location</h4>
                                    <a className="text-muted-foreground hover:text-primary transition-colors"> Washington DC-Baltimore Area</a>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8">
                            <h4 className="font-medium mb-4"> Connect With Me</h4>
                            <div className="flex space-x-4 justify-center">
                                <a href="https://x.com/jd_francoc" target="_blank">
                                    <TwitterIcon />
                                </a>
                                <a href="https://public.tableau.com/app/profile/jd.franco/vizzes" target="_blank">
                                    <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="23"
                                    height="23"
                                    viewBox="0 0 32 32"
                                    >
                                    <path
                                        fill="currentColor"
                                        d="M15.536.235v2.937h-2.624v.771h2.624V6.88h.933V3.943h2.624v-.771h-2.624V.235zm8.043 3.016v4.328h-3.943v1.233h3.943v4.251h1.391l.009-2.109l.032-2.099l1.953-.032l1.943-.011V7.579H24.97V3.251zm-16.543.077v4.256H3.052v1.228h3.984v4.256h1.313V8.812h4.015V7.579H8.349V3.328zm8.115 7.027v4.791h-4.405v1.584h4.405v4.797h1.709V16.73h4.411v-1.584H16.86v-4.791zm12.964 2.066v2.959h-2.688v1.084h2.688v3.015h1.183v-3.015h2.703V15.38h-2.703v-2.959zm-25.484.172v2.901H0v.828h2.631v2.928h.891v-2.928h2.667v-.828H3.48v-2.901zm20.948 6.027v4.339h-4.027v1.235h4.027v4.285h1.427v-4.285h3.979v-1.235h-3.979V18.62zm-16.62.011v4.328H3.016v1.235h3.943v4.255h1.468v-4.255h3.937v-1.235H8.427v-4.333h-.733zm8.421 6.104v2.937h-2.625v1.077h2.625v3.016h1.24l.016-1.489l.02-1.527h2.631v-1.077H16.62v-2.937z"
                                    />
                                    </svg>

                                </a>
                                <a href="https://www.instagram.com/jd_francoc/" target="_blank">
                                    <Instagram />
                                </a>
                                <a href="https://www.linkedin.com/in/jdfranco/" target="_blank">
                                    <Linkedin />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-8 rounded-lg shadow-xs">
                        <h3 className="text-2xl font-semibold mb-6">
                            Send a Message
                        </h3>

                        
                        <form 
                        action="https://formspree.io/f/xvojpoaa" 
                        method="POST" 
                        className="space-y-6"
                        >
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2"> Your Name</label>
                                <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                                placeholder="John Doe..."
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2"> Your Email</label>
                                <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                                placeholder="John.Doe@domain.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2"> Your Message</label>
                                <textarea
                                id="message"
                                name="message"
                                required
                                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Hello, I'd like to talk about..."
                                />
                            </div>

                            {/* You can add a hidden input for redirection or subject if needed */}
                            {/* <input type="hidden" name="_subject" value="New message from portfolio site" /> */}

                            <button 
                                type="submit" 
                                className={cn("cosmic-button w-full flex items-center justify-center gap-2")}
                            > 
                                Send Message
                                <Send size={16} />
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </section>
    )
};