"use client";

const Footer = () => {
  const handlePrivacyPolicyClick = () => {
    console.log("Privacy Policy clicked");
    // Add your privacy policy functionality here
    // Examples:
    // window.open('/privacy-policy', '_blank');
    // router.push('/privacy-policy');
    // setShowPrivacyModal(true);
  };

  return (
    <div className="bg-[#F0F6FF]  px-4 py-3   rounded-b-lg ">
      <p className="text-[#4D4D4D] font-bold text-base leading-[26px] tracking-[0]">
        By using this chatbot, you agree to our{" "}
        <button
          onClick={handlePrivacyPolicyClick}
          className="text-[#1158E5] font-bold text-base leading-[26px] underline  cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        >
          Privacy Policy
        </button>
        .
      </p>
    </div>
  );
};

export default Footer;
