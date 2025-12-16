import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useDataContext } from "../context/useDataContext"

const DashboardHeader = () => {
  const {  logout } = useDataContext()
  const navigate = useNavigate()

  const logoutUser = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const activeClass = "underline underline-offset-4 font-semibold text-black"
  const normalClass = "text-gray-700 hover:text-black"

  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">

        <p className="font-semibold text-lg">Intellisage AI</p>

        <ul className="flex items-center gap-8 text-sm font-medium">

          <li>
            <NavLink
              to="/summarize"
              className={({ isActive }) => isActive ? activeClass : normalClass}
            >
              Summarize PDF
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/chat"
              className={({ isActive }) => isActive ? activeClass : normalClass}
            >
              Start a Chat
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/plans"
              className={({ isActive }) => isActive ? activeClass : normalClass}
            >
              Plans
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/account"
              className={({ isActive }) => isActive ? activeClass : normalClass}
            >
              Account
            </NavLink>
          </li>

        </ul>

        <div className="flex items-center gap-4">
          <button
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            onClick={logoutUser}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}

export default DashboardHeader
