import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import BackButton from "../Common/BackButton";
import styles from './Sup.module.css';
import longHairedGirl from "../../assets/images/long-haired-girl-watching-through-binoculars (2) 1.png"; 
import socialMediaIcons from "../../assets/images/Social media icons.svg"; 
import phoneIcon from "../../assets/images/ic_baseline-phone.svg"; 
import emailIcon from "../../assets/images/ic_baseline-email.svg"; 
import addressIcon from "../../assets/images/mdi_address-marker.svg"; 

const Support = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = () => {
        // Logic for submission can be added here if necessary
        // Redirecting to the confirmation page
        navigate('/confirmation'); // Use navigate instead of history.push
    };

    return (
        _jsxs("div", { className: styles.support, children: [
            _jsx(BackButton, { to: "/", className: "light" }),
            _jsx("div", { className: styles.supportChild }),
            _jsxs("div", { className: styles.groupParent, children: [
                _jsxs("div", { className: styles.rectangleParent, children: [
                    _jsx("div", { className: styles.groupChild }),
                    _jsx("div", { className: styles.groupItem }),
                    _jsx("div", { className: styles.groupInner }),
                    _jsxs("label", { className: styles.fullName, children: ["Full Name:", 
                        _jsx("input", { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value) })
                    ] }),
                    _jsxs("label", { className: styles.email, children: ["Email:", 
                        _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value) })
                    ] }),
                    _jsxs("label", { className: styles.message, children: ["Message:", 
                        _jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value) })
                    ] })
                ] }),
                _jsx("b", { className: styles.niceHearingFrom, children: "Nice hearing from you!" }),
                _jsx("div", { className: styles.submitWrapper, children: 
                    _jsx("button", { className: styles.submit, onClick: handleSubmit, children: "Submit" })
                })
            ]}),
            _jsx("div", { className: styles.supportItem }),
            _jsxs("div", { className: styles.letsGetInTouchParent, children: [
                _jsxs("div", { className: styles.letsGetInContainer, children: [
                    _jsx("span", { children: `Lets Get in ` }),
                    _jsx("b", { className: styles.touch, children: "Touch!" })
                ]}),
                _jsxs("div", { className: styles.haveAQuestionContainer, children: [
                    _jsx("p", { className: styles.haveAQuestion, children: `Have a question or need assistance? Reach out to us via email, ` }),
                    _jsx("p", { className: styles.haveAQuestion, children: "phone, or the contact form below. We're eager to assist you." })
                ]})
            ]}),
            _jsx("img", { className: styles.longHairedGirlWatchingThroIcon, alt: "", src: longHairedGirl }),
            _jsx("img", { className: styles.socialMediaIcons, alt: "", src: socialMediaIcons }),
            _jsxs("div", { className: styles.contactUsParent, children: [
                _jsx("div", { className: styles.contactUs, children: "Contact Us:" }),
                _jsxs("div", { className: styles.conrtacrt, children: [
                    _jsx("div", { className: styles.div, children: "+91 9203904734" }),
                    _jsx("div", { className: styles.vibenetgmailcom, children: "vibenet@gmail.com" }),
                    _jsx("div", { className: styles.vitVelloreInstitute, children: "VIT (Vellore Institute of Technology)" }),
                    _jsx("img", { className: styles.icbaselinePhoneIcon, alt: "", src: phoneIcon }),
                    _jsx("img", { className: styles.icbaselineEmailIcon, alt: "", src: emailIcon }),
                    _jsx("img", { className: styles.mdiaddressMarkerIcon, alt: "", src: addressIcon })
                ]})
            ]}),
            _jsx("div", { className: styles.vibenetWrapper, children: _jsxs("i", { className: styles.vibenet, children: [
                _jsx("span", { children: "Vibe" }),
                _jsx("span", { className: styles.net, children: "Net" })
            ]}) })
        ]}
        )
    );
};

export default Support;
