import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>M.Sc. in Water Science</h4>
                <h5>INRS, Québec, Canada</h5>
              </div>
              <h3>2024-NOW</h3>
            </div>
            <p>
              Focusing on numerical modeling, machine learning, and scientific data analysis. Leading thesis on Bias Correction of Ensemble Environmental Forecasts using Deep Learning (LSTM).
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Research Intern</h4>
                <h5>INRS, Canada</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Contributed to the research project "Non-stationary Modelling of Wind Speed" managing large datasets and analyzing results. Awarded the MITACS Globalink Research Internship.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>WordPress Developer</h4>
                <h5>Inspired by Dream Foundation</h5>
              </div>
              <h3>2020-21</h3>
            </div>
            <p>
              Maintained and updated client websites, including content updates and functional improvements. Enhanced website usability and performance using WordPress plugins and configuration tools.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>CodeChef Club Leader</h4>
                <h5>SRMIST, India</h5>
              </div>
              <h3>2019-23</h3>
            </div>
            <p>
              Managed a core team of 50 members and mentored a community group of over 1000 members, helping them in Competitive Programming and Software Development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
