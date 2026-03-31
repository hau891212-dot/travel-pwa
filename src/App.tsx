{/* 標題高度大約是 88px */}
<div className="sticky top-0 z-50 bg-brand-bg/70 backdrop-blur-xl border-b border-[#E0E5D5]/30">
  <header className="p-6 pb-2 flex justify-between items-start">
    {/* ... 標題與頭像內容 ... */}
  </header>

  {/* 行程頁面的日期橫向選單 (只有 schedule 會顯示) */}
  <AnimatePresence>
    {activeTab === 'schedule' && (
      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="flex gap-3 overflow-x-auto pb-4 px-6 no-scrollbar">
        {/* ... 日期按鈕 ... */}
      </motion.div>
    )}
  </AnimatePresence>
</div>