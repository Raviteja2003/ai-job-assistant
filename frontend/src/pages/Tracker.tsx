export default function Tracker() {
  return (
    <div style={{ padding:"32px 36px", maxWidth:860, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#2563EB", marginBottom:5 }}>Coming soon</p>
      <h1 style={{ fontSize:24, fontWeight:600, color:"#111827", letterSpacing:"-0.02em", marginBottom:8 }}>Job Tracker</h1>
      <p style={{ fontSize:14, color:"#6B7280" }}>Track every application, interview, and offer — coming in Feature 6.</p>
      <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
        {[
          { label:"Saved", color:"#6B7280", bg:"#F3F4F6", role:"Frontend Engineer", company:"Stripe" },
          { label:"Applied", color:"#854D0E", bg:"#FEF9C3", role:"Software Engineer", company:"Google" },
          { label:"Interview", color:"#166534", bg:"#DCFCE7", role:"Full Stack Developer", company:"Notion" },
        ].map((item,i)=>(
          <div key={i} style={{ background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:13.5, fontWeight:500, color:"#111827", marginBottom:2 }}>{item.role}</p>
              <p style={{ fontSize:12, color:"#9CA3AF" }}>{item.company}</p>
            </div>
            <span style={{ fontSize:12, fontWeight:500, color:item.color, background:item.bg, padding:"3px 10px", borderRadius:20 }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, background:"#F8F9FA", border:"2px dashed #E5E7EB", borderRadius:10, padding:"20px 16px", textAlign:"center" }}>
        <p style={{ fontSize:13, color:"#9CA3AF" }}>Full CRUD tracker coming in Feature 6</p>
      </div>
    </div>
  );
}