import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import Button from "./Button"; // Adjust the import path as necessary

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { registerWithEmailAndPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  let initialValues = {
    name: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Required")
      .min(4, "Must be at least 4 characters long")
      .matches(/^[a-zA-Z]+$/, "Name can only contain letters"),
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long")
      .matches(/^[a-zA-Z]+$/, "Password can only contain letters"),
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, password } = formik.values;
    if (formik.isValid === true) {
      registerWithEmailAndPassword(name, email, password);
      setLoading(true);
    } else {
      setLoading(false);
      alert("Check your input fields");
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleRegister,
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="grid grid-cols-1 justify-items-center items-center">
          <ClipLoader color="#ffffff" size={150} speedMultiplier={0.5} />
        </div>
      ) : (
        <Card className="w-96 bg-white/90 backdrop-filter backdrop-blur-sm rounded-lg">
          <CardHeader
            variant="gradient"
            className="mb-4 grid h-28 place-items-center bg-[#008000] rounded-t-lg"
          >
            <Typography variant="h3" color="white">
              REGISTER
            </Typography>
          </CardHeader>

          <CardBody className="flex flex-col gap-4">
            <form onSubmit={handleRegister}>
              <div className="mb-2">
                <Input
                  name="name"
                  type="text"
                  label="Name"
                  size="lg"
                  {...formik.getFieldProps("name")}
                  onFocus={() => formik.setFieldTouched("name", true)}
                  onBlur={() => formik.setFieldTouched("name", formik.values.name !== '')}
                />
                {formik.touched.name && formik.errors.name && (
                  <Typography
                    variant="small"
                    color="red"
                    className="transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    {formik.errors.name}
                  </Typography>
                )}
              </div>
              <div className="mt-4 mb-2">
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  size="lg"
                  {...formik.getFieldProps("email")}
                  onFocus={() => formik.setFieldTouched("email", true)}
                  onBlur={() => formik.setFieldTouched("email", formik.values.email !== '')}
                />
                {formik.touched.email && formik.errors.email && (
                  <Typography
                    variant="small"
                    color="red"
                    className="transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    {formik.errors.email}
                  </Typography>
                )}
              </div>
              <div className="mt-4 mb-2">
                <Input
                  name="password"
                  type="password"
                  label="Password"
                  size="lg"
                  {...formik.getFieldProps("password")}
                  onFocus={() => formik.setFieldTouched("password", true)}
                  onBlur={() => formik.setFieldTouched("password", formik.values.password !== '')}
                />
                {formik.touched.password && formik.errors.password && (
                  <Typography
                    variant="small"
                    color="red"
                    className="transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    {formik.errors.password}
                  </Typography>
                )}
              </div>
              <div className="mb-4"></div>
              <Button label="Register" type="submit" className="w-full h-12 flex items-center justify-center rounded-lg" />
            </form>
          </CardBody>
          <CardFooter className="pt-0 rounded-b-lg">
            <div className="mt-6 flex items-center font-roboto text-base justify-center">
              Already have an account?
              <Link to="/login">
                <p className="ml-1 font-bold font-roboto text-sm text-blue-500 text-center">
                  Login
                </p>
              </Link>
            </div>
            {/* Customer Support Button */}
            <div className="mt-4 flex justify-start w-full">
              <Link to="/customer-support" className="text-blue-500 hover:text-blue-700 transition-colors">
                <Button label="Customer Support" />
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Register;
