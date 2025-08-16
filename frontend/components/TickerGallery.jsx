import React from "react";

/** Mapa rápido ticker -> dominio para Clearbit.
 *  (Añade aquí los que quieras; si no hay dominio, se muestra fallback con iniciales)
 */
const LOGO_DOMAIN = {
  // Tech
  AAPL: "apple.com", MSFT: "microsoft.com", GOOGL: "google.com", AMZN: "amazon.com",
  NVDA: "nvidia.com", META: "meta.com", TSLA: "tesla.com", ADBE: "adobe.com",
  CRM: "salesforce.com", ORCL: "oracle.com", INTC: "intel.com", AMD: "amd.com",
  CSCO: "cisco.com", IBM: "ibm.com", QCOM: "qualcomm.com", TXN: "ti.com",
  AVGO: "broadcom.com", AMAT: "appliedmaterials.com", MU: "micron.com", NOW: "servicenow.com",

  // Finance
  JPM: "jpmorganchase.com", BAC: "bankofamerica.com", WFC: "wellsfargo.com",
  GS: "goldmansachs.com", MS: "morganstanley.com", C: "citi.com",
  AXP: "americanexpress.com", PNC: "pnc.com", USB: "usbank.com", TFC: "truist.com",
  SCHW: "schwab.com", BK: "bnymellon.com", BLK: "blackrock.com", COF: "capitalone.com",
  AIG: "aig.com", MET: "metlife.com", PRU: "prudential.com", MMC: "marshmclennan.com",
  CME: "cmegroup.com", ICE: "theice.com",

  // Healthcare
  JNJ: "jnj.com", PFE: "pfizer.com", MRK: "merck.com", ABBV: "abbvie.com",
  BMY: "bms.com", LLY: "lilly.com", AMGN: "amgen.com", GILD: "gilead.com",
  BIIB: "biogen.com", VRTX: "vrtx.com", REGN: "regeneron.com", ISRG: "intuitive.com",
  CVS: "cvshealth.com", UNH: "unitedhealthgroup.com", CI: "cigna.com", HUM: "humana.com",
  ANTM: "elevancehealth.com", ZBH: "zimmerbiomet.com", MDT: "medtronic.com", BSX: "bostonscientific.com",

  // Energy
  XOM: "corporate.exxonmobil.com", CVX: "chevron.com", COP: "conocophillips.com",
  PSX: "phillips66.com", MPC: "marathonpetroleum.com", VLO: "valero.com", OXY: "oxy.com",
  SLB: "slb.com", HAL: "halliburton.com", BKR: "bakerhughes.com", EOG: "eogresources.com",
  PXD: "pxd.com", DVN: "devonenergy.com", APA: "apacorp.com", FANG: "diamondbackenergy.com",
  MRO: "marathonoil.com", HES: "hess.com", KMI: "kindermorgan.com", WMB: "williams.com", OKE: "oneok.com",

  // Industrials
  BA: "boeing.com", CAT: "cat.com", DE: "deere.com", GE: "ge.com", HON: "honeywell.com",
  MMM: "3m.com", UNP: "up.com", NSC: "nscorp.com", CSX: "csx.com", FDX: "fedex.com",
  UPS: "ups.com", LMT: "lockheedmartin.com", NOC: "northropgrumman.com", RTX: "rtx.com",
  GD: "gd.com", ETN: "eaton.com", EMR: "emerson.com", DOV: "dovercorporation.com",
  PCAR: "paccar.com", ITW: "itw.com",

  // Consumer
  PG: "pg.com", KO: "coca-colacompany.com", PEP: "pepsico.com", WMT: "walmart.com",
  COST: "costco.com", MDLZ: "mondelezinternational.com", CL: "colgatepalmolive.com",
  KMB: "kimberly-clark.com", MO: "altria.com", PM: "pmi.com", TGT: "target.com",
  HD: "homedepot.com", LOW: "lowes.com", MCD: "mcdonalds.com", SBUX: "starbucks.com",
  YUM: "yum.com", NKE: "nike.com", DIS: "disney.com", NFLX: "netflix.com", ROST: "rossstores.com",

  // Utilities
  NEE: "nexteraenergy.com", DUK: "duke-energy.com", SO: "southerncompany.com",
  D: "dominionenergy.com", EXC: "exeloncorp.com", AEP: "aep.com", XEL: "xcelenergy.com",
  ED: "coned.com", PEG: "pseg.com", WEC: "wecenergygroup.com",

  // Real Estate
  PLD: "prologis.com", AMT: "americantower.com", CCI: "crowncastle.com", SPG: "simon.com",
  EQIX: "equinix.com", PSA: "publicstorage.com", O: "realtyincome.com", DLR: "digitalrealty.com",
  VTR: "ventasreit.com", HST: "hosthotels.com",

  // Materials / Others
  LIN: "linde.com", APD: "airproducts.com", SHW: "sherwin-williams.com", DOW: "dow.com",
  DD: "dupont.com", FCX: "fcx.com", NEM: "newmont.com", ALB: "albemarle.com",
  MOS: "mosaicco.com", CF: "cfindustries.com", TS: "tenaris.com", VALE: "vale.com",
  RIO: "riotinto.com", BHP: "bhp.com", SCCO: "southernperu.com", AA: "alcoa.com",
  STLD: "stld.com", NUE: "nucor.com", CLF: "clevelandcliffs.com", X: "ussteel.com",

  // Colombia (algunos ejemplos)
  "ECOPETROL.CL": "ecopetrol.com.co",
  "GRUPOAVAL.CL": "grupoaval.com",
  "PFAVAL.CL": "grupoaval.com",
  "GRUPOSURA.CL": "gruposura.com",
  "PFGRUPSURA.CL": "gruposura.com",
  "EXITO.CL": "grupoexito.com",
  "GEB.CL": "geb.com.co",
  "CELSIA.CL": "celsia.com",
  "TERPEL.CL": "terpel.com",
  "BVC.CL": "bvc.com.co",
};

/* helper de URL: Clearbit sirve png/png transparente por dominio */
const logoFor = (t) => {
  const domain = LOGO_DOMAIN[t];
  return domain ? `https://logo.clearbit.com/${domain}?size=64` : null;
};

const sectors = {
  Tech: ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","ADBE","CRM","ORCL","INTC","AMD","CSCO","IBM","QCOM","TXN","AVGO","AMAT","MU","NOW"],
  Finance: ["JPM","BAC","WFC","GS","MS","C","AXP","PNC","USB","TFC","SCHW","BK","BLK","COF","AIG","MET","PRU","MMC","CME","ICE"],
  Healthcare: ["JNJ","PFE","MRK","ABBV","BMY","LLY","AMGN","GILD","BIIB","VRTX","REGN","ISRG","CVS","UNH","CI","HUM","ANTM","ZBH","MDT","BSX"],
  Energy: ["XOM","CVX","COP","PSX","MPC","VLO","OXY","SLB","HAL","BKR","EOG","PXD","DVN","APA","FANG","MRO","HES","KMI","WMB","OKE"],
  Industrials: ["BA","CAT","DE","GE","HON","MMM","UNP","NSC","CSX","FDX","UPS","LMT","NOC","RTX","GD","ETN","EMR","DOV","PCAR","ITW"],
  Consumer: ["PG","KO","PEP","WMT","COST","MDLZ","CL","KMB","MO","PM","TGT","HD","LOW","MCD","SBUX","YUM","NKE","DIS","NFLX","ROST"],
  Utilities: ["NEE","DUK","SO","D","EXC","AEP","XEL","ED","PEG","WEC"],
  RealEstate: ["PLD","AMT","CCI","SPG","EQIX","PSA","O","DLR","VTR","HST"],
  Others: ["LIN","APD","SHW","DOW","DD","FCX","NEM","ALB","MOS","CF","TS","VALE","RIO","BHP","SCCO","AA","STLD","NUE","CLF","X"],
  Colombia: ["TERPEL.CL","PFGRUPSURA.CL","PROMIGAS.CL","PFGRUPOARG.CL","PFDAVVNDA.CL","PFCORFICOL.CL","PFCIBEST.CL","PFCEMARGOS.CL","PFAVAL.CL","PEI.CL","NUAMCO.CL","MINEROS.CL","ICOLCAP.CL","HCOLSEL.CL","GRUPOSURA.CL","GRUPOAVAL.CL","GRUPOARGOS.CL","GRUBOLIVAR.CL","GEB.CL","EXITO.CL","ETB.CL","ENKA.CL","ECOPETROL.CL","CORFICOLCF.CL","CONCONCRET.CL","CNEC.CL","CIBEST.CL","CEMARGOS.CL","CELSIA.CL","BVC.CL","BOGOTA.CL","BHI.CL"],
};

export default function TickerGallery({ selection, setSelection }) {
  const all = Object.values(sectors).flat();

  const toggle = (t) => {
    setSelection((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const Badge = ({ t }) => {
    const src = logoFor(t);
    return (
      <button
        className="badge"
        onClick={() => toggle(t)}
        aria-pressed={selection.includes(t)}
        title={selection.includes(t) ? "Quitar" : "Seleccionar"}
        style={{ outline: selection.includes(t) ? "2px solid var(--accent)" : "none" }}
      >
        <span className="logo">
          {src ? (
            <img
              className="logo-img"
              src={src}
              alt=""
              loading="lazy"
              onError={(e) => (e.currentTarget.remove())} /* si falla, se ve el fallback de letras */
            />
          ) : (
            t.slice(0, 2)
          )}
        </span>
        <span className="symbol">{t}</span>
      </button>
    );
  };

  return (
    <div className="card">
      <h3 className="section-title">Universo de activos</h3>
      <div className="scroll">
        {all.map((t) => (
          <Badge key={t} t={t} />
        ))}
      </div>
      <p className="small" style={{ marginTop: 8 }}>
        Seleccionados: {selection.length} • Tip: puedes elegir más de 7; el backend recorta a K tras una preselección.
      </p>
    </div>
  );
}
